import './App.css';
import { UserProfile } from "./components/UserProfile";
import { Posters } from "./components/Posters";
import { Figures } from "./components/Figures";

function App() {
    const userColors = {
        self : "orangered",
        similar : "dodgerblue",
        other : "lightblue"
    }

    const itemColors = {
        recommended : "limegreen",
        rated : "mediumpurple",
        other : "orange"
    }
  return (
    <>
        <Posters/>
        <div>
            <UserProfile/>
            <Figures userColors={userColors} itemColors={itemColors}/>
        </div>
    </>
  );
}

export default App;
