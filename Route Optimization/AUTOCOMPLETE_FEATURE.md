# Autocomplete Suggestions Feature

## Overview

The search bar now includes **Google Places Autocomplete** functionality, providing real-time suggestions for both **addresses and place names** as users type. You can search for:
- **Street addresses**: "123 Main St, City, State"
- **Place names**: "Walmart super center, ruston", "Starbucks downtown", "Target near me"
- **Businesses**: Any business name with location

This makes entering delivery addresses faster and more accurate.

## Features

### Real-Time Suggestions
- Suggestions appear automatically as you type (after 3+ characters)
- Uses Google Places Autocomplete API
- **Supports both addresses and place names** (businesses, establishments, landmarks)
- 300ms debounce to reduce API calls
- Location-biased results prioritize addresses and places near your start location

### User Interface
- **Dropdown menu** appears below the search bar
- **Main text** (bold): Primary address information
- **Secondary text**: City, state, and additional details
- **Hover highlighting**: Suggestions highlight on mouse hover
- **Keyboard selection**: Selected suggestion highlighted in blue
- **Scrollable**: Long lists can be scrolled

### Keyboard Navigation
- **Arrow Down**: Navigate to next suggestion
- **Arrow Up**: Navigate to previous suggestion
- **Enter**: Select the highlighted suggestion
- **Escape**: Close suggestions dropdown
- **Tab**: Close suggestions and move to next field

### Mouse Interaction
- **Click suggestion**: Selects and adds the address
- **Click outside**: Closes suggestions dropdown
- **Hover**: Highlights suggestion

## How It Works

### Backend Implementation

1. **Autocomplete Endpoint**: `GET /api/optimize/geocode/autocomplete`
   - Accepts query string and optional location
   - Returns array of suggestions from Google Places API
   - **No type restrictions** - searches addresses, establishments, and all place types
   - Location bias improves relevance for nearby addresses and places

2. **Place Details Endpoint**: `POST /api/optimize/geocode/place-details`
   - Accepts Google Place ID
   - Returns full address details with coordinates
   - More accurate than regular geocoding

### Frontend Implementation

1. **Debounced API Calls**: Waits 300ms after user stops typing
2. **State Management**: Tracks suggestions, selected index, visibility
3. **Event Handlers**: Keyboard and mouse interactions
4. **Click Outside Detection**: Closes dropdown when clicking elsewhere

## API Requirements

### Google Maps API Key Setup

Your API key must have these APIs enabled:

1. **Places API (Autocomplete)**
   - Go to Google Cloud Console
   - Enable "Places API"
   - The Autocomplete feature is part of Places API

2. **Places API (Details)**
   - Same as above
   - Used to get coordinates from Place ID

3. **Geocoding API**
   - Fallback if Place Details fails
   - Also used for regular address geocoding

### API Restrictions (Recommended)

For security, restrict your API key to:
- **HTTP referrers**: Your domain (e.g., `localhost:3000`, `yourdomain.com`)
- **APIs**: Only enable the APIs you need

## Usage Examples

### Basic Address Search
```
1. User types "123 Main"
2. Suggestions appear: "123 Main St, New York, NY", "123 Main Ave, Brooklyn, NY", etc.
3. User clicks on "123 Main St, New York, NY"
4. Address is geocoded and added as stop
```

### Place Name Search
```
1. User types "Walmart super center, ruston"
2. Suggestions appear: "Walmart Supercenter, Ruston, LA", "Walmart Neighborhood Market, Ruston, LA", etc.
3. User clicks on a suggestion or presses Enter
4. Place address is automatically found and added as stop
```

### Business Search
```
1. User types "Starbucks downtown"
2. Suggestions show nearby Starbucks locations
3. User selects the desired location
4. Address is automatically geocoded and added
```

### Keyboard Navigation
```
1. User types "123 Main"
2. Suggestions appear
3. User presses Arrow Down (highlights first suggestion)
4. User presses Arrow Down again (highlights second suggestion)
5. User presses Enter (selects highlighted suggestion)
6. Address is added
```

### Location Bias
```
1. Start location is set to "New York, NY"
2. User types "123 Main"
3. Suggestions prioritize "123 Main St, New York, NY" over "123 Main St, Los Angeles, CA"
```

## Technical Details

### Debouncing
- **300ms delay**: Reduces API calls while typing
- **Clears previous timer**: Prevents multiple API calls
- **Cleanup on unmount**: Prevents memory leaks

### Error Handling
- **API failures**: Falls back to regular geocoding
- **No suggestions**: User can still type full address and press Enter
- **Network errors**: Shows error message, doesn't crash

### Performance
- **Efficient rendering**: Only renders visible suggestions
- **Memoization**: Prevents unnecessary re-renders
- **Lazy loading**: Suggestions only load when needed

## Browser Compatibility

- **Modern browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile browsers**: iOS Safari, Chrome Mobile
- **Keyboard support**: All modern browsers
- **Touch support**: Mobile devices supported

## Troubleshooting

### Suggestions Not Appearing
1. Check Google Maps API key is set in `.env`
2. Verify Places API is enabled in Google Cloud Console
3. Check browser console for errors
4. Ensure API key has proper restrictions

### Wrong Suggestions
- Suggestions are location-biased
- Set start location for better results
- Try typing more specific address (include city, state)

### Keyboard Navigation Not Working
- Ensure input field is focused
- Check browser supports keyboard events
- Try clicking on input field first

## Future Enhancements

Potential improvements:
- **Recent searches**: Show previously searched addresses
- **Favorites**: Save frequently used addresses
- **Voice input**: Speech-to-text for address entry
- **Address validation**: Real-time validation as user types
- **Multi-language support**: Suggestions in different languages

---

**The autocomplete feature makes address entry fast and accurate!** 🚀

