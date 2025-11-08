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
    skill_level VARCHAR(20), -- beginner, intermediate, advanced, expert
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rivers (top-level organization)
CREATE TABLE IF NOT EXISTS rivers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    state VARCHAR(50),
    country VARCHAR(50) DEFAULT 'USA',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- USGS Gauges for flow data
CREATE TABLE IF NOT EXISTS gauges (
    id SERIAL PRIMARY KEY,
    usgs_id VARCHAR(50) UNIQUE NOT NULL, -- USGS station ID
    name VARCHAR(255) NOT NULL,
    river_id INTEGER REFERENCES rivers(id) ON DELETE CASCADE,
    location GEOGRAPHY(POINT, 4326), -- Gauge location
    url VARCHAR(500), -- USGS gauge URL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- River Reaches (THE PRIMARY UNIT - like American Whitewater)
-- A reach is a section of river from put-in to take-out
CREATE TABLE IF NOT EXISTS reaches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL, -- e.g., "Chili Bar Run", "Upper Gauley"
    river_id INTEGER REFERENCES rivers(id) ON DELETE CASCADE,
    gauge_id INTEGER REFERENCES gauges(id) ON DELETE SET NULL,

    -- Geographic data
    putin_location GEOGRAPHY(POINT, 4326) NOT NULL,
    putin_name VARCHAR(255), -- e.g., "Chili Bar Access"
    putin_notes TEXT, -- Parking, fees, etc.

    takeout_location GEOGRAPHY(POINT, 4326) NOT NULL,
    takeout_name VARCHAR(255),
    takeout_notes TEXT,

    -- Reach characteristics
    length_miles DECIMAL(6, 2),
    gradient_fppm INTEGER, -- Average gradient

    -- Difficulty range (since it's flow-dependent)
    difficulty_min VARCHAR(10), -- Min difficulty at low flow
    difficulty_max VARCHAR(10), -- Max difficulty at high flow

    -- Flow information
    min_runnable_flow INTEGER, -- Minimum CFS
    max_runnable_flow INTEGER, -- Maximum recommended CFS
    optimal_flow_min INTEGER,
    optimal_flow_max INTEGER,

    -- Other info
    description TEXT,
    season VARCHAR(100),
    permit_required BOOLEAN DEFAULT FALSE,
    permit_info TEXT,
    shuttle_notes TEXT,

    -- References
    aw_id INTEGER UNIQUE, -- American Whitewater ID

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial indexes
CREATE INDEX IF NOT EXISTS idx_reaches_putin ON reaches USING GIST(putin_location);
CREATE INDEX IF NOT EXISTS idx_reaches_takeout ON reaches USING GIST(takeout_location);
CREATE INDEX IF NOT EXISTS idx_reaches_river ON reaches(river_id);
CREATE INDEX IF NOT EXISTS idx_reaches_gauge ON reaches(gauge_id);

-- Individual Rapids within reaches
CREATE TABLE IF NOT EXISTS rapids (
    id SERIAL PRIMARY KEY,
    reach_id INTEGER REFERENCES reaches(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- e.g., "Troublemaker", "Satan's Cesspool"
    river_mile DECIMAL(6, 2), -- Mile marker from putin
    location GEOGRAPHY(POINT, 4326),

    -- Rapid characteristics
    description TEXT,
    difficulty_low_flow VARCHAR(10), -- Difficulty at low flow
    difficulty_high_flow VARCHAR(10), -- Difficulty at high flow

    -- Features
    type VARCHAR(50), -- ledge, hole, wave train, boulder garden, etc.
    mandatory BOOLEAN DEFAULT TRUE, -- Can it be portaged easily?
    scout_recommended BOOLEAN DEFAULT FALSE,
    portage_notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rapids_reach ON rapids(reach_id);
CREATE INDEX IF NOT EXISTS idx_rapids_location ON rapids USING GIST(location);

-- Trip Reports (USER-SUBMITTED RUNS - KEY FOR FLOW-DEPENDENT DATA)
-- This is how we get flow-dependent difficulty ratings
CREATE TABLE IF NOT EXISTS trip_reports (
    id SERIAL PRIMARY KEY,
    reach_id INTEGER REFERENCES reaches(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

    -- Run details
    run_date DATE NOT NULL,
    flow_cfs INTEGER NOT NULL, -- Flow level when they ran it
    gauge_height_ft DECIMAL(6, 2),

    -- User's assessment
    difficulty_rating VARCHAR(10) NOT NULL, -- What difficulty THEY thought it was
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5), -- Overall quality/fun rating

    -- Conditions
    water_level_assessment VARCHAR(20), -- too-low, low, medium, high, too-high

    -- Report content
    title VARCHAR(255),
    report TEXT,
    recommendation TEXT, -- Would they recommend this flow?

    -- Metadata
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trip_reports_reach ON trip_reports(reach_id);
CREATE INDEX IF NOT EXISTS idx_trip_reports_user ON trip_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_reports_flow ON trip_reports(flow_cfs);
CREATE INDEX IF NOT EXISTS idx_trip_reports_date ON trip_reports(run_date);

-- User-reported hazards (flow-dependent)
CREATE TABLE IF NOT EXISTS hazard_reports (
    id SERIAL PRIMARY KEY,
    rapid_id INTEGER REFERENCES rapids(id) ON DELETE CASCADE,
    reach_id INTEGER REFERENCES reaches(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

    -- Hazard details
    hazard_type VARCHAR(50) NOT NULL, -- undercut, sieve, strainer, hole, pin-spot, etc.
    severity VARCHAR(20), -- minor, moderate, serious, deadly
    description TEXT NOT NULL,

    -- Flow dependency
    flow_min INTEGER, -- Hazard present above this flow
    flow_max INTEGER, -- Hazard present below this flow
    flow_cfs_when_observed INTEGER,

    -- Location
    location_description TEXT, -- "river right below the pour-over"
    location GEOGRAPHY(POINT, 4326),

    -- Status
    is_permanent BOOLEAN DEFAULT TRUE, -- vs temporary (like a new strainer)
    reported_date DATE NOT NULL,
    verified_by_users INTEGER DEFAULT 1, -- How many users confirmed this

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hazard_reports_rapid ON hazard_reports(rapid_id);
CREATE INDEX IF NOT EXISTS idx_hazard_reports_reach ON hazard_reports(reach_id);

-- Current flow data from gauges
CREATE TABLE IF NOT EXISTS flow_readings (
    id SERIAL PRIMARY KEY,
    gauge_id INTEGER REFERENCES gauges(id) ON DELETE CASCADE,

    flow_cfs INTEGER NOT NULL,
    gauge_height_ft DECIMAL(6, 2),
    temperature_f DECIMAL(4, 1),

    recorded_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(gauge_id, recorded_at)
);

CREATE INDEX IF NOT EXISTS idx_flow_readings_gauge ON flow_readings(gauge_id);
CREATE INDEX IF NOT EXISTS idx_flow_readings_time ON flow_readings(recorded_at);

-- Discussion threads (can be for reaches OR specific rapids)
CREATE TABLE IF NOT EXISTS discussions (
    id SERIAL PRIMARY KEY,
    reach_id INTEGER REFERENCES reaches(id) ON DELETE CASCADE,
    rapid_id INTEGER REFERENCES rapids(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,

    -- Tags
    is_beta BOOLEAN DEFAULT FALSE, -- Beta/advice
    is_question BOOLEAN DEFAULT FALSE,
    is_conditions_report BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CHECK (reach_id IS NOT NULL OR rapid_id IS NOT NULL)
);

-- Discussion replies
CREATE TABLE IF NOT EXISTS discussion_replies (
    id SERIAL PRIMARY KEY,
    discussion_id INTEGER REFERENCES discussions(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    parent_reply_id INTEGER REFERENCES discussion_replies(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Photos (for reaches or rapids)
CREATE TABLE IF NOT EXISTS photos (
    id SERIAL PRIMARY KEY,
    reach_id INTEGER REFERENCES reaches(id) ON DELETE CASCADE,
    rapid_id INTEGER REFERENCES rapids(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

    filename VARCHAR(255) NOT NULL,
    caption TEXT,
    flow_cfs INTEGER, -- Flow when photo was taken
    taken_at DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CHECK (reach_id IS NOT NULL OR rapid_id IS NOT NULL)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_discussions_reach ON discussions(reach_id);
CREATE INDEX IF NOT EXISTS idx_discussions_rapid ON discussions(rapid_id);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_discussion ON discussion_replies(discussion_id);
CREATE INDEX IF NOT EXISTS idx_photos_reach ON photos(reach_id);
CREATE INDEX IF NOT EXISTS idx_photos_rapid ON photos(rapid_id);

-- Create a view for aggregated difficulty ratings by flow range
-- This gives us the "community consensus" difficulty at different flows
CREATE OR REPLACE VIEW reach_difficulty_by_flow AS
SELECT
    reach_id,
    CASE
        WHEN flow_cfs < 500 THEN '0-500'
        WHEN flow_cfs < 1000 THEN '500-1000'
        WHEN flow_cfs < 2000 THEN '1000-2000'
        WHEN flow_cfs < 3000 THEN '2000-3000'
        WHEN flow_cfs < 5000 THEN '3000-5000'
        WHEN flow_cfs < 10000 THEN '5000-10000'
        ELSE '10000+'
    END as flow_range,
    AVG(
        CASE difficulty_rating
            WHEN 'I' THEN 1
            WHEN 'II' THEN 2
            WHEN 'III' THEN 3
            WHEN 'III+' THEN 3.5
            WHEN 'IV-' THEN 3.8
            WHEN 'IV' THEN 4
            WHEN 'IV+' THEN 4.5
            WHEN 'V-' THEN 4.8
            WHEN 'V' THEN 5
            WHEN 'V+' THEN 5.5
            WHEN 'VI' THEN 6
        END
    ) as avg_difficulty_numeric,
    MODE() WITHIN GROUP (ORDER BY difficulty_rating) as most_common_rating,
    COUNT(*) as num_reports,
    MIN(flow_cfs) as min_flow,
    MAX(flow_cfs) as max_flow
FROM trip_reports
GROUP BY reach_id, flow_range;
