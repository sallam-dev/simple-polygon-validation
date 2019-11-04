const { readFileSync, writeFileSync } = require("fs");
var simplepolygon = require('simplepolygon');


function getPath(argv) {
	return argv[2]
}

function renderZoneError(feature) {
	if (!feature.properties.etag || !feature.properties.tag) {
		return {
			...feature,
			properties: {
				...feature.properties,
				"stroke": "#f00",
				"stroke-width": 2,
				"stroke-opacity": 1,
				"fill": "#00f0f0",
				"fill-opacity": 0.7,
			}
		}
	} else if (simplepolygon(feature).features.length > 1) {
		return {
			...feature,
			properties: {
				...feature.properties,
				"stroke": "#f00",
				"stroke-width": 2,
				"stroke-opacity": 1,
				"fill": "#f0f000",
				"fill-opacity": 0.7,
			}
		}
	} else {
		return feature
	}
}

const geojson = JSON.parse(readFileSync(getPath(process.argv), 'utf-8'))

const zonesWithMissingNames = geojson.features.filter(f => !f.properties.etag || !f.properties.tag)
const selfIntersectingZones = geojson.features.filter(f => simplepolygon(f).features.length > 1)

const badZones = {
	type: 'FeatureCollection',
	features: [
		...zonesWithMissingNames.map(feature => {
			return {
				...feature,
				properties: {
					...feature.properties,
					"stroke": "#f00",
					"stroke-width": 2,
					"stroke-opacity": 1,
					"fill": "#00f0f0",
					"fill-opacity": 0.7,
				}
			}
		}),
		...selfIntersectingZones.map(feature => {
			return {
				...feature,
				properties: {
					...feature.properties,
					"stroke": "#00f",
					"stroke-width": 2,
					"stroke-opacity": 1,
					"fill": "#f0f000",
					"fill-opacity": 0.7,
				}
			}
		}),

	]
}

if (badZones.features.length == 0) {
	console.log('No bad zones')
	process.exit(0)
} else {
	writeFileSync(getPath(process.argv), JSON.stringify({
		type: 'FeatureCollection',
		features: geojson.features.map(renderZoneError)
	},null, 2))
	console.log(JSON.stringify(badZones, null, 2))
	process.exit(1)
}