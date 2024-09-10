import { useContext, useEffect } from "react";
import { Search } from "../contexts/SearchContext";

export default function Map(){
    
    const {searchCriteria} = useContext(Search);
    let lat=searchCriteria.location.lat;
    let lon=searchCriteria.location.lon;

    useEffect(()=>{
        const fetchChurches = async () => {
            //const res = await fetch("https://localhost:3000/api/v1/churches/nearby-search?lat="+lat+"&lon="+lon+"&distance=2");
            //const data = await res.json();
            
        }

        fetchChurches();
    },[lat, lon]);



    let src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15454.87827031619!2d"+lon+"!3d"+lat+"!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses-419!2sco!4v1724981524837!5m2!1ses-419!2sco";
    //src="https://maps.googleapis.com/maps/api/staticmap?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&center=4.683362244026201,-74.0770341378309&zoom=15&format=png&maptype=roadmap&style=element:geometry%7Ccolor:0xf5f5f5&style=element:labels.icon%7Cvisibility:off&style=element:labels.text.fill%7Ccolor:0x616161&style=element:labels.text.stroke%7Ccolor:0xf5f5f5&style=feature:administrative%7Celement:geometry%7Cvisibility:off&style=feature:administrative.land_parcel%7Celement:labels.text.fill%7Ccolor:0xbdbdbd&style=feature:poi%7Cvisibility:off&style=feature:poi%7Celement:geometry%7Ccolor:0xeeeeee&style=feature:poi%7Celement:labels.text.fill%7Ccolor:0x757575&style=feature:poi.park%7Celement:geometry%7Ccolor:0xe5e5e5&style=feature:poi.park%7Celement:labels.text.fill%7Ccolor:0x9e9e9e&style=feature:road%7Celement:geometry%7Ccolor:0xffffff&style=feature:road%7Celement:labels.icon%7Cvisibility:off&style=feature:road.arterial%7Celement:labels.text.fill%7Ccolor:0x757575&style=feature:road.highway%7Celement:geometry%7Ccolor:0xdadada&style=feature:road.highway%7Celement:labels.text.fill%7Ccolor:0x616161&style=feature:road.local%7Celement:labels.text.fill%7Ccolor:0x9e9e9e&style=feature:transit%7Cvisibility:off&style=feature:transit.line%7Celement:geometry%7Ccolor:0xe5e5e5&style=feature:transit.station%7Celement:geometry%7Ccolor:0xeeeeee&style=feature:water%7Celement:geometry%7Ccolor:0xc9c9c9&style=feature:water%7Celement:labels.text.fill%7Ccolor:0x9e9e9e&size=480x360";
    //src="https://maps.google.com/maps?width=100%&amp;height=100%&amp;hl=en&amp;q=England, UK&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed";
    return (
        <>
            <iframe id="gmap" title="gmap" src={src} width="100%" height="100%" style={{border:0}} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
        </>
    );
}