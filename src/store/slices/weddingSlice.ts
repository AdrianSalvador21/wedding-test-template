import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { WeddingData, WeddingState, RSVPFormData } from '../../types/wedding';
import { weddingApi } from '../../services/weddingApi';


// Estado inicial
const initialState: WeddingState = {
  currentWedding: null,
  loading: false,
  error: null,
  initialized: false,
};

// Acciones asíncronas (thunks)
export const fetchWeddingData = createAsyncThunk(
  'wedding/fetchWeddingData',
  async ({ weddingId, guestId }: { weddingId: string; guestId?: string }, { rejectWithValue }) => {
    try {
      const response = await weddingApi.getById(weddingId, guestId);
      
      if (!response.success) {
        return rejectWithValue(response.error || 'Error al obtener los datos de la boda');
      }
      
      return response.data as WeddingData;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error desconocido');
    }
  }
);

export const submitRSVP = createAsyncThunk(
  'wedding/submitRSVP',
  async (rsvpData: RSVPFormData, { rejectWithValue }) => {
    try {
      const response = await weddingApi.submitRSVP(rsvpData);
      
      if (!response.success) {
        return rejectWithValue(response.error || 'Error al enviar la confirmación');
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error desconocido');
    }
  }
);

// Slice de Redux
const weddingSlice = createSlice({
  name: 'wedding',
  initialState,
  reducers: {
    // Limpiar errores
    clearError: (state) => {
      state.error = null;
    },
    
    // Reset del estado
    resetWeddingState: (state) => {
      state.currentWedding = null;
      state.loading = false;
      state.error = null;
      state.initialized = false;
    },
    
    // Actualizar tema dinámicamente
    updateTheme: (state, action: PayloadAction<Partial<WeddingData['theme']>>) => {
      if (state.currentWedding) {
        state.currentWedding.theme = {
          ...state.currentWedding.theme,
          ...action.payload
        };
      }
    },
    
    // Marcar como inicializado
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.initialized = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Fetch Wedding Data
    builder
      .addCase(fetchWeddingData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeddingData.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWedding = action.payload;
        state.initialized = true;
        state.error = null;
      })
      .addCase(fetchWeddingData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.initialized = true;
      })
      
      // Submit RSVP
      .addCase(submitRSVP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitRSVP.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        // Aquí podrías actualizar algún estado relacionado con RSVP si es necesario
      })
      .addCase(submitRSVP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Acciones exportadas
export const { 
  clearError, 
  resetWeddingState, 
  updateTheme, 
  setInitialized 
} = weddingSlice.actions;

// Selectores
export const selectWeddingState = (state: { wedding: WeddingState }) => state.wedding;
export const selectCurrentWedding = (state: { wedding: WeddingState }) => state.wedding.currentWedding;
export const selectWeddingLoading = (state: { wedding: WeddingState }) => state.wedding.loading;
export const selectWeddingError = (state: { wedding: WeddingState }) => state.wedding.error;
export const selectWeddingInitialized = (state: { wedding: WeddingState }) => state.wedding.initialized;

// Selectores específicos de datos
export const selectCouple = (state: { wedding: WeddingState }) => state.wedding.currentWedding?.couple;
export const selectEvent = (state: { wedding: WeddingState }) => state.wedding.currentWedding?.event;
export const selectGallery = (state: { wedding: WeddingState }) => state.wedding.currentWedding?.gallery;
export const selectTimeline = (state: { wedding: WeddingState }) => state.wedding.currentWedding?.timeline;
export const selectTheme = (state: { wedding: WeddingState }) => state.wedding.currentWedding?.theme;
export const selectAccommodation = (state: { wedding: WeddingState }) => state.wedding.currentWedding?.accommodation;
export const selectTransport = (state: { wedding: WeddingState }) => state.wedding.currentWedding?.transport;

export default weddingSlice.reducer; 