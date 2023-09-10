import './App.css';
import { UserProfile } from "./components/UserProfile";
import React, {useState, useRef} from "react";
import { Steps } from 'intro.js-react';
import "intro.js/introjs.css";

function App() {

    // Define state variables
    const [initialStepsEnabled, setInitialStepsEnabled] = useState(true);
    const [showInitialSteps, setShowInitialSteps] = useState(true);
    const stepsRef = useRef(null);

    // Define intro steps
    const initialSteps = [
        {
            element: '.UserProfile',
            intro: 'In this section, you can create and edit your movie profile.',
            position: 'middle-right',
        },
        {
            element: '.movie-select',
            intro: 'Select a movie title from the dropdown menu to add it to your profile. ' +
                'You can search for a specific movie title or type a release year to filter the ' +
                'options and find a movie to rate.',
            position: 'right',
        },
        {
            element: '.dropdown-menus-container',
            intro: 'Rate the selected movie on a scale from 0.5 to 5.0',
            position: 'right',
        },
        {
            element: '#addMovieButton',
            intro: 'Add the movie to your movie profile',
            position: 'right',
        },
        {
            element: '.group-container',
            intro: 'Your rated movies appear here. ' +
                'You can edit your rating by clicking on the stars and ' +
                'remove the movie from your profile by clicking on the delete ' +
                'button to the right',
            position: 'right',
        },
        {
            element: '#submitButton',
            intro: 'After adding at least five movies to your movie profile, ' +
                'click on Generate Recommendations button to get movie recommendations.',
            position: 'right',
        },
        {
            element: '.movie-select',
            intro: 'Now, add more movies to your movie profile.',
            position: 'right',
        },
    ];

    return (
        <div className='main-page'>
            <p id="app-header">MFExplain</p>
            <UserProfile/>
            <Steps
                enabled={showInitialSteps}
                steps={initialSteps}
                initialStep={0}
                onExit={() => setInitialStepsEnabled(false)}
                onComplete={() => setShowInitialSteps(false)}
                tooltipClass="custom-tooltip"
                options={{
                    tooltipClass: "custom-tooltip",
                    tooltipOptions: {
                        placement: "top",
                        arrowOffset: 20,
                        showStepNumbers: true,
                        showButtons: true,
                    },
                }}
            />
            <style>
                {`.custom-tooltip {
                     background-color: #faf9f9;
                     color: #555b6e;
                     border-radius: 20px;
                     font-size: 16px;    
                }
                .custom-tooltip .introjs-button {
                      height: 20px;
                      width: 80px;
                      padding: 0px 0px;
                      border-radius: 30px;
                      border-width: 1px;
                      border-style: solid;
                      border-color: #555b6e;
                      background-color: #555b6e;
                      color: #faf9f9;
                      font-weight: bold;
                      font-size: 11px;
                      text-align: center;
                      text-shadow: none;  
                }
                .custom-tooltip .introjs-skipbutton {
                      padding: 0px 0px;
                      position: absolute;
                      top: 0px;
                      right: 0px;
                      border-radius: 60px;
                      background-color: #faf9f9;
                      color: #555b6e;
                      font-weight: bold;
                      font-size: 14px;  
                `
                }
            </style>
        </div>
    );
};

export default App;
