#' This script will generate the simulated data

{ # Setup -------------------------------------------------------------------
  
  { # Dependencies ---------------------------------------------------------------
    library(tidyverse)
    library(geojsonio)  
    library(jsonlite)
  }
}


{ # Line Data ---------------------------------------------------------------
  
  df_line_raw = read_csv("../src/data/data_line.csv")
  
  df_line_raw %>% 
    pivot_wider(names_from = group, values_from = value) %>% 
    write.csv("../src/data/data_line_wide.csv")
}






{ # Outputs --------------------------------------------
  
  { # Penguins ----------------------------------------------------------------
    
    df_penguins = penguins %>% drop_na()
    
    df_penguins %>% write_csv("../public/data/data_penguins.csv")
    
  }
  
  
  { ## Spatial -----------------------------------------------------------------
    
    region_tmp = 'Northeast'
    division_tmp =  "Middle Atlantic"
    
    vec__state_abbr = xwalk_state %>% 
      # filter(division_name == division_tmp) %>% 
      filter(region_name == region_tmp) %>% 
      pull(state_abbr)
    
    { ###  county_topo.json ----------------------------------------------------------------
      
      
      ### Op
      ### - select only PA, DE, MD
      ### - rename as per original data structure
      
      sf_init = sf_county_seed %>% 
        left_join(xwalk_state) %>% 
        filter(state_abbr%in%vec__state_abbr)
      
      sf_uhc = sf_init %>%  
        mutate(id = geoid) %>% 
        select(id,
               AREACD = geoid,
               AREANM = county_name)
      
      ### Export
      sf_uhc %>% 
        geojsonio::topojson_write(
          file = "../public/data/geo_counties.json",
          object_name  = 'geog')
      
      }
    
    { ### data_state.csv ----------------------------------------------------------
      
      df_region %>% glimpse()
      
      ## Intermediates
      df_demographics_tmp = df_demographics %>% 
        filter(geo == 'state') 
      
      df_pop_wide = df_demographics_tmp %>% 
        select(-median_age) %>% 
        pivot_wider(names_from = year, values_from = pop) %>% 
        drop_na() %>% 
        mutate(`2001` = 0,
               `2002` = 0,
               `2003` = 0,
               `2004` = 0,
               `2005` = 0,
               `2006` = 0,
               `2007` = 0,
               `2008` = 0) %>% 
        select(sort(names(.))) %>% 
        select(geo, state_fip = geoid, geoid, everything())
      
      
      
      ## Final
      df_data_state = df_pop_wide %>% 
        left_join(xwalk_state) %>% 
        filter(state_abbr%in%vec__state_abbr) %>% 
        select(code = state_fip,
               name = state_name, 
               # area = aland_mile2,
               # density = pop_dens,
               # age_med = median_age,
               matches("\\b\\d{4}\\b"))
      
      ## Export
      df_data_state %>% write_csv("../public/data/data_state.csv")
      
    }
    
    { ### data_county.csv ----------------------------------------------------------
      
      df_district %>% glimpse()
      
      ## Intermediates
      xwalk_county_state = sf_county_seed %>%
        as.data.frame() %>% 
        select(geoid, state_fip, county_name) %>% 
        as_tibble()
      
      df_demographics_tmp = df_demographics %>% 
        filter(geo == 'county') %>% 
        left_join(xwalk_county_state) %>% 
        left_join(xwalk_state) %>%
        filter(state_abbr%in%vec__state_abbr) %>%
        glimpse()
      
      df_pop_wide = df_demographics_tmp %>% 
        select(-median_age) %>% 
        pivot_wider(names_from = year, values_from = pop) %>% 
        drop_na() %>% 
        mutate(`2001` = 0,
               `2002` = 0,
               `2003` = 0,
               `2004` = 0,
               `2005` = 0,
               `2006` = 0,
               `2007` = 0,
               `2008` = 0) %>% 
        select(sort(names(.))) %>% 
        select(geo, geoid, everything())
      
      df_spatial_metadata = sf_county_seed %>% 
        as.data.frame() %>% 
        as_tibble() %>% 
        select(geoid, county_name,  aland_mile2,pop_dens) 
      
      df_age = df_demographics_tmp %>% 
        filter(year == 2020) %>% 
        select(geoid, median_age)
      
      ## Final
      df_data_county = df_pop_wide %>% 
        left_join(df_spatial_metadata) %>% 
        left_join(df_age) %>% 
        select(code = geoid,
               name = county_name,
               parent = state_fip,
               area = aland_mile2,
               density = pop_dens,
               age_med = median_age,
               matches("\\b\\d{4}\\b"))
      
      ## Export
      df_data_county %>% write_csv("../public/data/data_county.csv")
      
    }  
  }
  { # Longitudinal --------------------------------------------------------
    
    df_us = read.csv("raw/NCHS_-_Death_rates_and_life_expectancy_at_birth.csv") %>% as_tibble() %>% 
      janitor::clean_names() %>% 
      filter(race == "All Races", sex == 'Both Sexes',
             year > 1980) %>% 
      select(year, 
             le = average_life_expectancy_years) %>% 
      mutate(group = 'US')
    
    df_philly =  read.csv("raw/le_gpt_philly.csv") %>% as_tibble() %>% 
      mutate(group = "Philadelphia")
    
    df_data = bind_rows(df_philly, df_us)
    
    
    df_data %>% 
      ggplot(aes(x =year, y = le, group = group, color = group))+
      geom_line()+
      ylim(60,80)
    
    df_data %>% jsonlite::write_json("../public/data/data_trends.json")
    
  }
}