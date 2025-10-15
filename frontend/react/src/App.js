import './App.css';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import DicomViewer from './components/DicomViewer/DicomViewer';

function App() {
    return (
        <div className="App">
            <Header/>
            <DicomViewer />
            <Footer/>
        </div>
    );
}

export default App;