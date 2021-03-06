import React, { Component } from 'react';
import Map from './Map';
import Sidebar from './Sidebar';
import * as PlacesAPI from '../PlacesAPI';
import '../css/App.css';

class App extends Component {
  constructor(props) {
    super()
    this.state = {
      placeList: [],
      placeListFiltered: [],
      markerInMapList: [],
      markerInMapActive: {},
    }
  }

  componentDidMount = () => {
    window.gm_authFailure = this.gm_authFailure
    this.menu = document.getElementById('burger-icon')
    this.sidebar = document.getElementById('sidebar')

    PlacesAPI.getAll()
    .then( response => {
      if (Object.keys(response).length > 0) {
        this.setState({placeList: response.venues})
      } else {
        this.setState({placeList: PlacesAPI.defaultList})
      }
    })
    .catch(error => window.alert(error))
  }

  onMenuClick = () => {
    this.menu.classList.toggle("open")
    this.sidebar.classList.toggle("open")
  }

  // Show the list of places corresponding to the filtered category
  handleSidebarFilter = (value) => {
    let placesFiltered
    if (value === "all") {
      placesFiltered = this.state.placeList
    } else {
      placesFiltered = this.state.placeList.filter( place => place.categories[0].id === value)
    }
    this.setState({
      placeListFiltered: placesFiltered,
    })
  }

  // When a place on the sidebar's list is clicked, find the corresponding marker
  handleSidebarPlaceClick = (place) => {
    const marker = this.state.markerInMapList.filter(marker => marker.id === place.id)
    this.handleMarkerSelected(marker[0])

    // In small windows close the menu to see the infoWindow
    if (window.innerWidth < 610) {
      this.onMenuClick()
    }
  }

  // When clicked on a marker or on the sidebar's list, activate this marker and deactivate the previous one
  handleMarkerSelected = (marker) => {
    let previousMarker = this.state.markerInMapActive
    if (marker !== previousMarker) {
      if (Object.keys(previousMarker).length > 0) {
        this.deactivateMarkerInMap(previousMarker)
      }
      marker.setAnimation(window.google.maps.Animation.BOUNCE)
      marker.setIcon({
        url: `${require("../images/active_marker.png")}`,
        scaledSize: new window.google.maps.Size(45,45)
      })
      this.setState({markerInMapActive: marker})
    }
  }

  // Deactivate marker, if another one is selected or the infoWindow is closed
  deactivateMarkerInMap = (marker) => {
    marker.setAnimation(window.google.maps.Animation.null)
    marker.setIcon({
      url: `${require("../images/default_marker.png")}`,
      scaledSize: new window.google.maps.Size(45,45)
    })
  }

  // When clicked on the infoWindow's close icon, close the infoWindow and deactivate the marker
  closeInfoWindow = (infoWindow) => {
    infoWindow.close()
    this.deactivateMarkerInMap(infoWindow.marker)
    this.setState({markerInMapActive: {}})
  }

  // Alert the user in case of Google Maps authentication error
  gm_authFailure = ()=> {
    window.alert("Google Maps error!")
  }


  render() {
    const {placeList, placeListFiltered, markerInMapList, markerInMapActive} = this.state;
    let places = (placeListFiltered.length >= 1) ? placeListFiltered : placeList;
    let MapWrapper;

    if (window.GMAPS_SUCCESS) {
      MapWrapper = <Map
            placeList={places}
            markerInMapList={markerInMapList}
            handleMarkerSelected={this.handleMarkerSelected}
            markerInMapActive={markerInMapActive}
            closeInfoWindow={this.closeInfoWindow}
            />
    }

    return (
      <div className="App">
        <header className="app-header">
          <div id="burger-icon" role="button" tabIndex="0" aria-label="menu" onClick={this.onMenuClick}>
            <div className="burger-icon-bar1"></div>
            <div className="burger-icon-bar2"></div>
            <div className="burger-icon-bar3"></div>
          </div>
          <h1 className="app-title">Explore Santiago</h1>
        </header>
        <main>
          <Sidebar
            placeList={places}
            onSidebarFilter={this.handleSidebarFilter}
            sidebarPlaceClick={this.handleSidebarPlaceClick}/>
          {MapWrapper}
        </main>
        <footer>
          <img src={require('../images/foursquare-logo.png')} alt="Foursquare logo"/>
        </footer>
      </div>
    );
  }
}

export default App;
