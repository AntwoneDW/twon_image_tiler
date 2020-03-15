import React, { useState, useEffect } from 'react';
import './App.css';
import Gallery from 'react-grid-gallery';
import axios from 'axios';

function App() {

    // Similar to componentDidMount and componentDidUpdate:
    useEffect(() => {
        document.title = 'Antwone Image Viewer';
        if(images.length < 1)
        {
            // Update the document title using the browser API
            axios.get('/images')
                .then(response => {
                    console.log(response);
                    const imgArrayFromServer = response.data;
                    setImages(imgArrayFromServer);
                }, error => {
                    console.log(error);
                });

        }
    });

    const [images, setImages] = React.useState(
      []
    );


  return (
          <Gallery images={images}/>
  );
}

export default App;
