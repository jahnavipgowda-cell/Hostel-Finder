import "../styles/pagination.css";

const Pagination = ({

                        page,

                        totalPages,

                        onChange

                    }) => {

    return (

        <div className="pagination">

            <button

                disabled={page===0}

                onClick={()=>onChange(page-1)}

            >

                Previous

            </button>

            <span>

                Page {page+1} of {totalPages}

            </span>

            <button

                disabled={page===totalPages-1}

                onClick={()=>onChange(page+1)}

            >

                Next

            </button>

        </div>

    );

};

export default Pagination;