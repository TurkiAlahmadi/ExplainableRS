
export const ToolDescription = ({isLoadingData, isGeneratingRecs}) => {
    return (
        <div className="Instructions" style={{top: isGeneratingRecs ? '250px' : '30px'}}>
            {isLoadingData && (
            <p>Instructions</p>
            )}
        </div>
    );
};