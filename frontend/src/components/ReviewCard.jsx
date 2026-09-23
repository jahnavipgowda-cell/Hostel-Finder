import Rating from "./Rating";
import "../styles/reviewcard.css";

const ReviewCard = ({ review }) => {
    if (!review) return null;

    return (
        <div className="review-card">
            <div className="review-header">
                <div>
                    <strong>{review.reviewerName || "Anonymous"}</strong>
                    <Rating rating={review.overallRating || 0} />
                </div>
                {review.verifiedStay && (
                    <span className="verified-review">✔ Verified Stay</span>
                )}
            </div>

            {review.comment && <p className="review-comment">{review.comment}</p>}

            {(review.pros || review.cons) && (
                <div className="ai-summary">
                    {review.pros && <p>👍 <strong>Liked:</strong> {review.pros}</p>}
                    {review.cons && <p>👎 <strong>Could improve:</strong> {review.cons}</p>}
                </div>
            )}
        </div>
    );
};

export default ReviewCard;
