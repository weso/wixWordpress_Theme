import json

def read(filename):
    with open(filename) as f:
        d = json.load(f)
    return d

def write(data, filename):
    with open(filename, 'w') as f:
        json.dump(data, f)

def pretty_write(data, filename):
    with open(filename, 'w') as f:
        json.dump(data, f, sort_keys=True,
                indent=4, separators=(',', ': '))

def step1(): # reading topojson, matching on some kind of name, writing wi_name prop
    topo = read('countries_regions.topojson')
    geometries = topo['objects']['countries']['geometries']
    primary = read('primary.json')

    unfound = []
    for country_name in primary:
        country_name = country_name.strip()
        found = False
        for match_country in geometries:
            if 'id' in match_country and match_country['id'].lower().find(country_name.lower()) != -1:
                match_country['wi_name'] = country_name
                found = True
            else:
                for key in ['NAME', 'NAME_LONG', 'BRK_NAME', 'NAME_SORT']:
                    if match_country['properties'][key].lower().find(country_name.lower()) != -1:
                        match_country['wi_name'] = country_name
                        found = True
        if not found:
            unfound.append(country_name)
    print unfound
    topo['objects']['countries']['geometries'] = geometries
    pretty_write(topo, 'countries_regions_wi_name.topojson')

# step 1.5 is manually adding wi_names for viet nam and venezuela

def step2(): # simple minification
    f = read('countries_regions_wi_name.topojson')
    write(f, 'wi_name_countries.topojson')

def step2_5(): # minifying by removing unnecessary properties
    topo = read('countries_regions_wi_name.topojson')
    geometries = topo['objects']['countries']['geometries']

    for country in geometries:
        if 'wi_name' in country:
            country['id'] = country['wi_name']
            del country['wi_name']
        for key in ['NAME', 'NAME_LONG', 'BRK_NAME', 'NAME_SORT', 'ECONOMY', 'REGION_WB']:
            del country['properties'][key]
        del country['properties']


    topo['objects']['countries']['geometries'] = geometries
    write(topo, 'wi_name_countries.topojson')

def step3():
    topo = read('wi_name_countries.topojson')
    geometries = topo['objects']['countries']['geometries']
    regions = {
        'Latin America & Caribbean': 1,
        'Sub-Saharan Africa': 2,
        'Europe & Central Asia': 3,
        'Middle East & North Africa': 4,
        'East Asia & Pacific': 5,
        'Antarctica': 6,
        'South Asia': 7,
        'North America': 8
    }

    dictionary = {}
    for country in geometries:
        if not 'wi_name' in country:
            continue
        else:
            name = country['wi_name']
            economy = country['properties']['ECONOMY'][0:1]
            region = regions[country['properties']['REGION_WB']]

            dictionary[name] = {'econ': economy, 'region': region}
    write(dictionary, 'economic_regional.json')

step2_5()
