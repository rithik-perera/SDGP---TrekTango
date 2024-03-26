import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, ScrollView } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Circle } from 'react-native-maps';
import Constants from 'expo-constants';
import CustomDialog from '../../CustomComponents/CustomDialog';
import CustomActivityIndicator from '../../CustomComponents/CustomActinityIndicator';

const RadiusSetScreen = ({ route, navigation }) => {
  const { longitude, latitude } = route.params;
  const mapRef = useRef(null);
  const [showDialog, setShowDialog] = useState(false);
  const [radius, setRadius] = useState(1000); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const radiusValues = [1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000];
  const [selectedRadiusValue, setSelectedRadiusValue] = useState(radiusValues[0]);
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false); 

  useEffect(() => {
    setLoading(true); 
    if (mapRef.current && mapLoaded) {
      setTimeout(() => {
        mapRef.current.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });
        setLoading(false); 
      }, 1000);
    }
  }, [mapLoaded]);


  const handleMapReady = () => {
    setMapLoaded(true);
  };

  const handleBackPress = () => {
    setShowDialog(true);
  };

  const handleDialogSelect = (option) => {
    setShowDialog(false);
    if (option === 'Yes') {
      navigation.goBack();
    }
  };

  const handleNextPress = () => {
    navigation.navigate('NearbyDestinations', {longitude, latitude, radius});
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const onRadiusChange = (value) => {
    setSelectedRadiusValue(value);
    setRadius(value);
    toggleDropdown();
    
    // new latitudeDelta and longitudeDelta based on the radius
    const delta = value / 112300; // 1 degree = 111.3 kilometers
    const latitudeDelta = value / 22000; // Adjust the division factor as needed for zoom level
    const longitudeDelta = delta;
  
    // Update the map's region to fit the circle
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude,
        longitude,
        latitudeDelta,
        longitudeDelta,
      });
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 10,
          longitudeDelta: 10,
        }}
        onMapReady={handleMapReady}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          title="Current Location"
          description="You are here"
        />
        <Circle
          center={{ latitude, longitude }}
          radius={radius}
          fillColor="rgba(106, 120, 220, 0.3)"
          strokeColor="rgba(0, 0, 255, 0.8)"
          strokeWidth={2}
        />
      </MapView>

      <View style={styles.overlay}>
        <View style={styles.containerTop}>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity onPress={handleBackPress} style={styles.button}>
              <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleDropdown} style={styles.selectedRadiusContainer}>
              <Text style={styles.selectedRadiusText}>{selectedRadiusValue} m</Text>
              {isDropdownOpen && (
                <ScrollView style={styles.dropdownContainer}>
                  {radiusValues.map(value => (
                    <TouchableOpacity
                      key={value}
                      onPress={() => onRadiusChange(value)}
                      style={styles.dropdownItem}
                    >
                      <Text>{value} m</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNextPress} style={styles.button}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>

          <CustomDialog
            visible={showDialog}
            title="Are you sure you want to go back?"
            message="Your unsaved changes will be lost."
            options={['Yes', 'No']}
            onSelect={handleDialogSelect}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  containerTop: {
    width: '100%',
    position: 'absolute',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 1,
    backgroundColor: 'rgba(1, 12, 51, 0.6)', // Transparent background for the overlay
    paddingTop: Constants.statusBarHeight,
    paddingBottom: 10,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    zIndex: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  radiusContainer: {
    width: '50%',
    alignItems: 'center',
  },
  selectedRadiusContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    position: 'relative', // Ensure relative positioning for the dropdownContainer
  },
  selectedRadiusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownContainer: {
    position: 'absolute',
    top: '165%', // Position below the radius button
    left: 0,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    maxHeight: 150,
    minWidth: 90,
    zIndex: 1,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default RadiusSetScreen;
