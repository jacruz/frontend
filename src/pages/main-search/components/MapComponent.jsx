import React, { useContext, useEffect, useRef } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { Search, SearchDispatch } from "../contexts/SearchContext.jsx";
import iconChurch from "../../../assets/img/church.png";
import error1 from "../../../assets/img/error1.png";
import iconChurchDisabled from "../../../assets/img/church-disabled.png";
import point from "../../../assets/img/point.gif";
import {isSearchCriteriaTimeInScheduleValue,formatTime24To12} from '../utils/SearchUtils.js'
import {getDistanceFromLatLonInKm} from '../utils/distanceCalculator.js'

export default function MapComponent({onSelectPoi}){
    
    const CONSTANTS = require("../../../utils/constants/Constants.js");
    const ENV_GMAPS_API_KEY = process.env.REACT_APP_GMAPS_API_KEY;
    const ENV_MAP_ID = process.env.REACT_APP_MAP_ID;
    const ENV_URL_SERVER = process.env.REACT_APP_URL_SERVER;
    
    const mapRef = useRef(null);
    
    const {searchCriteria, searchResults} = useContext(Search);
    const {searchResultsDispatch, searchCriteriaDispatch} = useContext(SearchDispatch);
    let lat = searchCriteria.location.lat;
    let lon = searchCriteria.location.lon;
    let distance = CONSTANTS.DEFAULT_DISTANCE_NEARBY_SEARCH;
    let scheduleIdSelected = searchCriteria.schedule_id;

    const url = ENV_URL_SERVER+"/api/v1/churches/nearby-search?lat="+lat+"&lon="+lon+"&distance="+distance;
    const searchResultsFiltered = useRef(searchResults);

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: ENV_GMAPS_API_KEY,
    });

    let isError = useRef(false);

    useEffect(()=>{

        try {
            const fetchChurches = async () => {

                try {
                    const res = await fetch(url, {
                        'mode': 'cors'
                    })
                    if(res.status===200){
                        const data = await res.json();
                        console.log(data);
            
                        //Filtrar resultado según cuadro de búsqueda
                        searchResultsFiltered.current = data.filter((el)=>{
                            if(el.schedules.find( (schedule)=> Number(schedule.id) === Number(scheduleIdSelected) ) ){
                                return el;
                            }
                            return null;
                        });
            
                        await searchResultsDispatch({
                            type:CONSTANTS.ACTION_UPDATE_RESULTS,
                            val:data
                        });
                    }else{
                        isError.current = true;
                    }
                } catch (error) {
                    isError.current = true;
                }
            }
            fetchChurches();
        } catch (error) {
            isError.current = true;
        }

    },[url, scheduleIdSelected, searchResultsDispatch, CONSTANTS.ACTION_UPDATE_RESULTS]);
    //console.log(lat + ", " + lon);
    
    function handleLoad(map) {
        mapRef.current = map;
        navigator?.geolocation.getCurrentPosition(
            ({ coords: { latitude: lat, longitude: lng } }) => {
                const locationObject = {
                    label:"Mi ubicación",
                    lat: lat,
                    lon: lng
                }
                searchCriteriaDispatch({
                    type:CONSTANTS.ACTION_UPDATE_LOCATION,
                    val:locationObject
                });
            }
        );
    }

    const handleMarkerClick = (poi) => {
        onSelectPoi(poi);
        console.log('click',poi);
    };

    function handleMapChanged() {
        if (!mapRef.current) return;
        const newPos = mapRef.current.getCenter().toJSON();
        //const newZoom = mapRef.current.getZoom();
        const newDistanceFromPrev = getDistanceFromLatLonInKm(lat,lon, newPos.lat, newPos.lng);
        //console.log('camera changed:', newPos, 'zoom:', newZoom, 'newDistanceFromPrev:', newDistanceFromPrev);

        if(newDistanceFromPrev > distance/2){//Mayor a la mitad de la distancia buscada antes? vuelva a buscar
            console.log("Actualizando!")
            lat = newPos.lat;
            lon = newPos.lng;
            const locationObject = {
                label:"Ubicación de usuario",
                lat: newPos.lat,
                lon: newPos.lng
            }
            searchCriteriaDispatch({
                type:CONSTANTS.ACTION_UPDATE_LOCATION,
                val:locationObject
            });
        }
    }

    function isShowDataPoi(poi){
        return poi.schedules.some(schedule => 
            Number(schedule.id) === Number(scheduleIdSelected) &&
            schedule.value.some(scheduleValue => 
                isSearchCriteriaTimeInScheduleValue(searchCriteria.time, scheduleValue)
            )
        )
    }

    if (!isLoaded) 
        return (
        <div style={{height:"100%", display:"flex", flexFlow:"column", justifyContent:"center", alignItems:"center"}}>
            <img alt='icon-loading' src={iconChurch} style={{width:'80px'}} ></img>
            <p>Loading...</p>
        </div>
        );

    if (isError.current){
        return (
        <div style={{height:"100%", width: "100%", display:"flex", flexFlow:"column", justifyContent:"center", alignItems:"center", position: "absolute"}}>
            <img alt='icon-loading' src={error1} style={{width:'100px'}} ></img>
            <p>Ha ocurrido un problema consultando datos</p>
        </div>
        );
    }

    return (
        <>
        <GoogleMap
            center={{lat: Number(lat), lng: Number(lon)}}
            zoom={16}
            mapContainerStyle={{ width: '100%', height: '100%', position: "absolute", zindex: "0" }}
            options={{
                mapId: ENV_MAP_ID,
                disableDefaultUI: true,
                maxZoom: 18,
                minZoom: 15
            }}
            onLoad={handleLoad}
            onCenterChanged={handleMapChanged}
            onZoomChanged={handleMapChanged}
        >
        {searchResults.map((poi,index) => (

            <Marker
                key={index}
                position={{lat: Number(poi.location.lat), lng: Number(poi.location.lon)}}
                onClick={() => handleMarkerClick(poi)}
                title={poi.name}
                icon={
                    isShowDataPoi(poi)
                    ?
                        {
                        url:iconChurch,
                        scaledSize:  new window.google.maps.Size(30,30)
                        }
                    :
                    {
                        url:iconChurchDisabled,
                        scaledSize:  new window.google.maps.Size(30,30)
                    }
                }
            >
                {
                    isShowDataPoi(poi) &&

                    <InfoWindow
                        position={{lat: Number(poi.location.lat), lng: Number(poi.location.lon)}}
                        options={{ disableAutoPan: true }}
                    >
                    <div
                        className='infoWindow-content'
                        onClick={()=>handleMarkerClick(poi)}
                    >
                        
                        <div>
                            {poi.schedules.map((schedule)=>(
                                
                                (Number(schedule.id) === Number(scheduleIdSelected)) &&
                                <div
                                    key={schedule.name}
                                >
                                    {schedule.value.map((scheduleValue)=>(
                                            <div
                                                key={scheduleValue.id}
                                            >
                                                { (isSearchCriteriaTimeInScheduleValue(searchCriteria.time, scheduleValue))
                                                    ?
                                                    scheduleValue.times.map((time)=>(
                                                        <p key={scheduleValue.id+time.start}
                                                        >{time.start?formatTime24To12(time.start):''}{time.end?'-'+formatTime24To12(time.end):''}</p>
                                                    ))
                                                    
                                                    :
                                                    null
                                                }
                                                
                                            </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                    </div>
                    </InfoWindow>
                }
                
            
            </Marker>
        ))}
        </GoogleMap>

        {/* Imagen flotante sobre el mapa */}
        <div
            className='point-center'
        >
            <img
                src={point}
                alt="o"
            />
        </div>

        </>
    );
};