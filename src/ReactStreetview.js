import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

import asyncLoading from "react-async-loader";

class ReactStreetview extends React.Component {
	constructor() {
		super();
		this.streetViewPanorama = null;
		this.streetViewService = null;
	}

	processStreetViewData = (data, status) => {
		const {
			streetViewPanoramaOptions,
			onPositionChanged,
			onPovChanged,
			noStreetViewFound
		} = this.props;

		if (status === "OK") {
			this.streetViewPanorama.setPano(data.location.pano);
			this.streetViewPanorama.setPov(streetViewPanoramaOptions.pov);
			this.streetViewPanorama.setVisible(true);

			this.streetViewPanorama.addListener("position_changed", () => {
				if (onPositionChanged) {
					onPositionChanged(this.streetViewPanorama.getPosition());
				}
			});

			this.streetViewPanorama.addListener("pov_changed", () => {
				if (onPovChanged) {
					onPovChanged(this.streetViewPanorama.getPov());
				}
			});
		} else {
			noStreetViewFound(status);
		}
	};

	initialize(canvas) {
		const { googleMaps, streetViewPanoramaOptions, radius } = this.props;
		if (googleMaps && this.streetViewPanorama === null) {
			this.streetViewService = new this.props.googleMaps.StreetViewService();
			this.streetViewPanorama = new googleMaps.StreetViewPanorama(canvas);
			console.log(streetViewPanoramaOptions.position);
			this.streetViewService.getPanorama(
				{ location: streetViewPanoramaOptions.position, radius },
				this.processStreetViewData
			);
		}
	}

	componentDidMount() {
		this.initialize(ReactDOM.findDOMNode(this));
	}

	componentDidUpdate() {
		this.initialize(ReactDOM.findDOMNode(this));
	}
	componentWillUnmount() {
		if (this.streetViewPanorama) {
			this.props.googleMaps.event.clearInstanceListeners(
				this.streetViewPanorama
			);
		}
	}

	render() {
		return (
			<div
				style={{
					height: "100%"
				}}
			/>
		);
	}
}

ReactStreetview.propTypes = {
	apiKey: PropTypes.string.isRequired,
	streetViewPanoramaOptions: PropTypes.object,
	searchRadius: PropTypes.number,
	noStreetViewFound: PropTypes.func,
	onPositionChanged: PropTypes.func,
	onPovChanged: PropTypes.func
};

ReactStreetview.defaultProps = {
	streetViewPanoramaOptions: {
		position: { lat: 46.9171876, lng: 17.8951832 },
		pov: { heading: 0, pitch: 0 },
		zoom: 1
	},
	searchRadius: 50,
	noStreetViewFound(status) {
		console.log(`No street view found: ${status}`);
	}
};

function mapScriptsToProps(props) {
	const googleMapsApiKey = props.apiKey;
	return {
		googleMaps: {
			globalPath: "google.maps",
			url: "https://maps.googleapis.com/maps/api/js?key=" + googleMapsApiKey,
			jsonp: true
		}
	};
}

export default asyncLoading(mapScriptsToProps)(ReactStreetview);
