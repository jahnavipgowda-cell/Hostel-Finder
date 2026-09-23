import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { getHostels, getAllCities } from "../services/hostelService";
import "../styles/chatbot.css";

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=300&q=80&auto=format&fit=crop";

const QUICK_REPLIES = [
    "PGs under ₹10,000",
    "Girls PG in Koramangala",
    "Hostels with food included",
    "How does the AI Pick work?",
];

const AREA_HINTS = [
    "koramangala", "indiranagar", "hsr layout", "hsr", "whitefield", "btm layout", "btm",
    "marathahalli", "electronic city", "jayanagar", "malleshwaram", "jp nagar", "bellandur",
    "banashankari", "yelahanka", "hebbal", "rajajinagar", "vijayanagar", "sarjapur",
    "basavanagudi", "kr puram", "domlur", "frazer town", "kammanahalli",
];

const TYPE_MAP = [
    { words: ["co-living", "coliving", "co living"], value: "CO_LIVING" },
    { words: ["student residence"], value: "STUDENT_RESIDENCE" },
    { words: ["working professional"], value: "WORKING_PROFESSIONAL" },
    { words: ["pg", "paying guest"], value: "PG" },
    { words: ["hostel"], value: "HOSTEL" },
];

const GENDER_MAP = [
    { words: ["girls", "female", "ladies", "women"], value: "FEMALE" },
    { words: ["boys", "male", "men"], value: "MALE" },
    { words: ["mixed", "co-ed", "coed"], value: "MIXED" },
];

function extractFilters(text, knownCities) {
    const lower = text.toLowerCase();
    const filters = {};

    // Budget: "under 10000", "below 15k", "within 8000", "under ₹12,000"
    const budgetMatch = lower.match(/(?:under|below|within|less than)\s*₹?\s*([\d,]+)\s*(k)?/);
    if (budgetMatch) {
        let amount = parseInt(budgetMatch[1].replace(/,/g, ""), 10);
        if (budgetMatch[2]) amount *= 1000;
        filters.maxPrice = amount;
    }

    // Type
    for (const t of TYPE_MAP) {
        if (t.words.some((w) => lower.includes(w))) {
            filters.type = t.value;
            break;
        }
    }

    // Gender
    for (const g of GENDER_MAP) {
        if (g.words.some((w) => lower.includes(w))) {
            filters.genderType = g.value;
            break;
        }
    }

    // Food
    if (lower.includes("food") || lower.includes("meal")) {
        filters.query = (filters.query ? filters.query + " " : "") + "food";
    }

    // City
    const cityHit = (knownCities || []).find((c) => lower.includes(c.toLowerCase()));
    if (cityHit) filters.city = cityHit;

    // Area / locality (used as a free-text query since search checks locality too)
    const areaHit = AREA_HINTS.find((a) => lower.includes(a));
    if (areaHit && !filters.city) {
        filters.query = areaHit;
    }

    return filters;
}

const FAQ = [
    {
        test: (l) => l.includes("ai pick") || l.includes("ai recommend") || l.includes("how does the ai"),
        reply:
            "Our AI Pick ranks hostels using rating, verified reviews, and an AI-computed safety score \u2014 not just who paid for a listing. You'll see a \ud83e\udd16 AI Pick badge on cards it recommends.",
    },
    {
        test: (l) => l.includes("book") || l.includes("booking"),
        reply:
            "Open any hostel's detail page and use the Book button \u2014 you'll need to be logged in first. You can track booking status from your Student Dashboard afterwards.",
    },
    {
        test: (l) => l.includes("compare"),
        reply:
            "Tap '+ Compare' on up to 3 hostel cards \u2014 a bar pops up at the bottom of the screen, and you can open a full side-by-side view from there.",
    },
    {
        test: (l) => l.includes("verified") || l.includes("verify") || l.includes("trust"),
        reply:
            "The \u2714 Verified badge means our team has confirmed the listing's address, ownership and photos \u2014 always a good filter to lean on if you're choosing remotely.",
    },
    {
        test: (l) => l.includes("owner") || l.includes("list my") || l.includes("add my hostel"),
        reply:
            "If you own a hostel/PG, register with the Owner role and you'll get an Owner Dashboard to add listings, manage rooms and respond to reviews.",
    },
    {
        test: (l) => l.includes("contact") || l.includes("support") || l.includes("help") && l.length < 15,
        reply:
            "I can help you search right here in chat \u2014 try something like \"PG under 12000 in Whitefield\". For anything account-specific, each hostel's page also has the owner's contact number.",
    },
];

function HostelMiniCard({ h }) {
    return (
        <Link to={`/hostel/${h.id}`} className="chat-hostel-card">
            <img
                src={h.thumbnailUrl || FALLBACK_IMAGE}
                alt={h.name}
                loading="lazy"
                onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_IMAGE;
                }}
            />
            <div className="chat-hostel-info">
                <strong>{h.name}</strong>
                <span>{h.locality}, {h.city}</span>
                <span className="chat-hostel-price">
                    ₹{Number(h.pricePerMonth).toLocaleString("en-IN")}/mo · ⭐ {h.rating}
                </span>
            </div>
        </Link>
    );
}

let idCounter = 0;
const nextId = () => `m${++idCounter}`;

const Chatbot = () => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: nextId(),
            from: "bot",
            text:
                "Hey! I'm the NestIQ assistant \ud83d\udc4b Tell me what you're looking for \u2014 city, budget, PG vs hostel \u2014 or tap a suggestion below.",
        },
    ]);
    const [input, setInput] = useState("");
    const [busy, setBusy] = useState(false);
    const [cities, setCities] = useState([]);
    const scrollRef = useRef(null);

    useEffect(() => {
        getAllCities().then(setCities).catch(() => setCities([]));
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, open]);

    const pushMessage = (msg) => setMessages((prev) => [...prev, { id: nextId(), ...msg }]);

    const handleSend = async (rawText) => {
        const text = (rawText ?? input).trim();
        if (!text || busy) return;

        pushMessage({ from: "user", text });
        setInput("");

        const lower = text.toLowerCase();

        if (/^(hi|hello|hey|hii+)\b/.test(lower)) {
            pushMessage({
                from: "bot",
                text: "Hi there! Ask me about hostels or PGs by city, area, budget or type \u2014 e.g. \"girls PG in HSR Layout under 12000\".",
            });
            return;
        }

        const faqHit = FAQ.find((f) => f.test(lower));
        if (faqHit) {
            pushMessage({ from: "bot", text: faqHit.reply });
            return;
        }

        setBusy(true);
        pushMessage({ from: "bot", text: "Let me check listings for that\u2026", pending: true });

        try {
            const filters = extractFilters(text, cities);
            if (!filters.query && !filters.city && !filters.type && !filters.genderType && !filters.maxPrice) {
                filters.query = text;
            }
            const page = await getHostels({ ...filters, size: 3, sortBy: "RATING" });
            const results = page?.content || [];

            setMessages((prev) => {
                const withoutPending = prev.filter((m) => !m.pending);
                if (results.length === 0) {
                    return [
                        ...withoutPending,
                        {
                            id: nextId(),
                            from: "bot",
                            text:
                                "I couldn't find an exact match for that. Try loosening the budget, or browse all listings on the Hostels page \u2014 I can also search a different city or area if you'd like.",
                        },
                    ];
                }
                return [
                    ...withoutPending,
                    {
                        id: nextId(),
                        from: "bot",
                        text: `Found ${page.totalElements ?? results.length} match${(page.totalElements ?? results.length) === 1 ? "" : "es"} \u2014 here are the top picks:`,
                        results,
                    },
                ];
            });
        } catch (err) {
            setMessages((prev) => prev.filter((m) => !m.pending));
            pushMessage({
                from: "bot",
                text: "Hmm, I couldn't reach the search service just now. Please try again in a moment.",
            });
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="nestiq-chatbot">
            {open && (
                <div className="chat-panel">
                    <div className="chat-header">
                        <div className="chat-header-title">
                            <span className="chat-avatar">🤖</span>
                            <div>
                                <strong>NestIQ Assistant</strong>
                                <div className="chat-status">● Online</div>
                            </div>
                        </div>
                        <button className="chat-close" onClick={() => setOpen(false)} aria-label="Close chat">
                            ✕
                        </button>
                    </div>

                    <div className="chat-body" ref={scrollRef}>
                        {messages.map((m) => (
                            <div key={m.id} className={`chat-bubble-row ${m.from}`}>
                                <div className={`chat-bubble ${m.from} ${m.pending ? "pending" : ""}`}>
                                    {m.text}
                                    {m.results && (
                                        <div className="chat-results">
                                            {m.results.map((h) => (
                                                <HostelMiniCard key={h.id} h={h} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {messages.length <= 1 && (
                        <div className="chat-quick-replies">
                            {QUICK_REPLIES.map((q) => (
                                <button key={q} onClick={() => handleSend(q)}>
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    <form
                        className="chat-input-row"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSend();
                        }}
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about a hostel, city or budget…"
                            disabled={busy}
                        />
                        <button type="submit" disabled={busy || !input.trim()}>
                            ➤
                        </button>
                    </form>
                </div>
            )}

            <button
                className={`chat-fab ${open ? "open" : ""}`}
                onClick={() => setOpen((v) => !v)}
                aria-label="Open NestIQ chat assistant"
            >
                {open ? "✕" : "💬"}
            </button>
        </div>
    );
};

export default Chatbot;
