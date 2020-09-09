import React, { useState, useEffect } from 'react';
import './App.css';

import { MenuItem, FormControl, Select, Card, CardContent } from '@material-ui/core';

import InfoBox from './components/InfoBox'
import Map from './components/Map'
import 'leaflet/dist/leaflet.css'
import Table from './components/Table'
import LineGraph from './components/LineGraph'
import { sortData, prettyPrintStat } from './components/util'


function App() {

  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState(['worldwide']);
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [casesType, setCasesType] = useState('cases');
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 } );
  const [mapZoom, setMapZoom] = useState(1);
  const [mapCountries, setMapCountries] = useState([]);


  useEffect(()=> {
    fetch('https://disease.sh/v3/covid-19/all')
      .then( response => response.json())
      .then( data => {
        setCountryInfo(data);
      });
  }, [])

  /*API call with an async function and useEffect-disease.sh*/ 
  useEffect(() => {
    const getCountriesData = async () => {
      await fetch('https://disease.sh/v3/covid-19/countries')
      .then( response => response.json())
      .then( data => {
        const countries = data.map( country => (
          {
            name: country.country,
            value: country.countryInfo.iso2 
          }
          ));
        const sortedData = sortData(data)
        setTableData(sortedData);
        setMapCountries(data);
        setCountries(countries);  
      }); 
    }
    getCountriesData();
  }, []);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;

    const url = 
      countryCode === 'worldwide'
      ? 'https://disease.sh/v3/covid-19/all'
      : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    
    await fetch(url)
    .then( response => response.json())
    .then(data => {
      setCountry(countryCode);
      setCountryInfo(data);
      //check this bellow doesnt work
      setMapCenter( [data.countryInfo.lat, data.countryInfo.long] );
      setMapZoom(4);
      console.log(data)
    });
  };

  return (
    <div className="app">
      <div className='app__left'>
        <div className='app__header'>
          <h1>COVID-19 TRACKER</h1>
          <FormControl className='app__dropdown'>
            <Select variant='outlined' value={country} onChange={onCountryChange}>
              <MenuItem value='worldwide'> Worldwide </MenuItem>
                  
              {countries.map( country => (
                <MenuItem value={country.value}>
                  {country.name}
                </MenuItem>
              ))}
            
            </Select>

            </FormControl>
        </div>

        <div className='app__stats'>

          <InfoBox
            isRed
            active={casesType === 'cases'} //if statement
            onClick={ e => setCasesType('cases')}
            title='Coronavirus Cases'
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={prettyPrintStat(countryInfo.cases)}
          />

          <InfoBox
            active={casesType === 'recovered'} //if statement
            onClick={ e => setCasesType('recovered')}
            title='Recovered'
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={prettyPrintStat(countryInfo.recovered)}
          />

          <InfoBox
            isRed
            active={casesType === 'deaths'} //if statement
            onClick={ e => setCasesType('deaths')}
            title='Deaths'
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={prettyPrintStat(countryInfo.deaths)}
          />

        </div>

        <Map
          countries={mapCountries}
          casesType={casesType}
          center={mapCenter}
          zoom={mapZoom}
        />

      </div>

      <Card className='app__right'>
        <CardContent>
          <h3>Live cases by country</h3>
          <Table countries={tableData}/>
          <h3  className='app__graphTitle' >Worldwide new {casesType}</h3>
          <LineGraph className='app__graph' casesType={casesType}/>
        </CardContent>
      </Card>

    </div>
  );
}

export default App;
