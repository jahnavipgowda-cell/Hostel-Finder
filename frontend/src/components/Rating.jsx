const Rating = ({ rating }) => {

    const stars = [];

    for(let i=1;i<=5;i++){

        stars.push(
            <span
                key={i}
                style={{
                    color:i<=Math.round(rating)?"gold":"lightgray",
                    fontSize:"20px"
                }}
            >
                ★
            </span>
        );
    }

    return(
        <div>

            {stars}

            <span style={{marginLeft:"8px"}}>
                ({rating})
            </span>

        </div>
    );

};

export default Rating;