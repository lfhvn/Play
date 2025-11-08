-- Enable PostGIS extension for geospatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(255),
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rapids table with geospatial data
CREATE TABLE IF NOT EXISTS rapids (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    river VARCHAR(255) NOT NULL,
    description TEXT,
    location GEOGRAPHY(POINT, 4326) NOT NULL, -- PostGIS geography type for lat/long
    difficulty VARCHAR(10), -- e.g., 'I', 'II', 'III', 'IV', 'V', 'VI'
    length_miles DECIMAL(6, 2),
    gradient_fppm INTEGER, -- feet per mile gradient
    optimal_flow_min INTEGER, -- CFS (cubic feet per second)
    optimal_flow_max INTEGER,
    season VARCHAR(100),
    hazards TEXT[],
    access_notes TEXT,
    permit_required BOOLEAN DEFAULT FALSE,
    aw_id INTEGER UNIQUE, -- American Whitewater ID for reference
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial index for efficient geospatial queries
CREATE INDEX IF NOT EXISTS idx_rapids_location ON rapids USING GIST(location);

-- River sections (for grouping rapids)
CREATE TABLE IF NOT EXISTS river_sections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    river VARCHAR(255) NOT NULL,
    state VARCHAR(50),
    country VARCHAR(50) DEFAULT 'USA',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Discussion threads for each rapid
CREATE TABLE IF NOT EXISTS discussions (
    id SERIAL PRIMARY KEY,
    rapid_id INTEGER REFERENCES rapids(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_trip_report BOOLEAN DEFAULT FALSE,
    run_date DATE,
    flow_level INTEGER, -- CFS at time of run
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Discussion replies/comments
CREATE TABLE IF NOT EXISTS discussion_replies (
    id SERIAL PRIMARY KEY,
    discussion_id INTEGER REFERENCES discussions(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    parent_reply_id INTEGER REFERENCES discussion_replies(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Photos for rapids
CREATE TABLE IF NOT EXISTS photos (
    id SERIAL PRIMARY KEY,
    rapid_id INTEGER REFERENCES rapids(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    filename VARCHAR(255) NOT NULL,
    caption TEXT,
    flow_level INTEGER,
    taken_at DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Flow data (current conditions)
CREATE TABLE IF NOT EXISTS flow_data (
    id SERIAL PRIMARY KEY,
    rapid_id INTEGER REFERENCES rapids(id) ON DELETE CASCADE,
    gauge_id VARCHAR(50), -- USGS gauge ID
    flow_cfs INTEGER NOT NULL,
    gauge_height_ft DECIMAL(6, 2),
    temperature_f DECIMAL(4, 1),
    recorded_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User ratings for rapids
CREATE TABLE IF NOT EXISTS rapid_ratings (
    id SERIAL PRIMARY KEY,
    rapid_id INTEGER REFERENCES rapids(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    difficulty_rating VARCHAR(10),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(rapid_id, user_id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_discussions_rapid_id ON discussions(rapid_id);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_discussion_id ON discussion_replies(discussion_id);
CREATE INDEX IF NOT EXISTS idx_photos_rapid_id ON photos(rapid_id);
CREATE INDEX IF NOT EXISTS idx_flow_data_rapid_id ON flow_data(rapid_id);
CREATE INDEX IF NOT EXISTS idx_rapid_ratings_rapid_id ON rapid_ratings(rapid_id);
