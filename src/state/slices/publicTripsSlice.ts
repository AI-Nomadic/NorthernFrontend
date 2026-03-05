import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Trip } from '@types';
import { getPublicTrips, forkTrip } from '@services/api';

export const fetchPublicTrips = createAsyncThunk(
    'publicTrips/fetchPublicTrips',
    async () => {
        return await getPublicTrips();
    }
);

export const cloneTrip = createAsyncThunk(
    'publicTrips/forkTrip',
    async (tripId: string) => {
        const forkedTrip = await forkTrip(tripId);
        if (!forkedTrip) throw new Error('Failed to fork trip');
        return forkedTrip;
    }
);

interface PublicTripsState {
    trips: Trip[];
    loading: boolean;
    error: string | null;
    forkStatus: 'idle' | 'loading' | 'success' | 'error';
    forkedTripId: string | null;
}

const initialState: PublicTripsState = {
    trips: [],
    loading: false,
    error: null,
    forkStatus: 'idle',
    forkedTripId: null,
};

const publicTripsSlice = createSlice({
    name: 'publicTrips',
    initialState,
    reducers: {
        resetForkStatus: (state) => {
            state.forkStatus = 'idle';
            state.forkedTripId = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPublicTrips.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPublicTrips.fulfilled, (state, action) => {
                state.loading = false;
                state.trips = action.payload;
            })
            .addCase(fetchPublicTrips.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch public trips';
            })
            .addCase(cloneTrip.pending, (state) => {
                state.forkStatus = 'loading';
            })
            .addCase(cloneTrip.fulfilled, (state, action) => {
                state.forkStatus = 'success';
                state.forkedTripId = action.payload.id;
            })
            .addCase(cloneTrip.rejected, (state, action) => {
                state.forkStatus = 'error';
                state.error = action.error.message || 'Failed to fork trip';
            });
    }
});

export const { resetForkStatus } = publicTripsSlice.actions;
export default publicTripsSlice.reducer;
