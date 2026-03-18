# ChordFlow - Chord Progression Randomizer

## Overview
ChordFlow is an Expo React Native mobile app that generates emotion-driven chord progressions with extensions for solo playing. It includes a visual flow chart of continuance showing the relationship between narration, voice, and pictures in harmonic motion.

## Architecture
- **Frontend**: Expo Router with file-based routing, tabs layout (Generate, Flow, Saved)
- **Backend**: Express server on port 5000 (serves landing page and API)
- **State**: AsyncStorage for persisting saved progressions
- **Fonts**: SpaceMono + JetBrains Mono via @expo-google-fonts
- **Theme**: Dark midnight blue (#0A0E1A) with amber (#F59E0B) accents

## Key Files
- `lib/music-engine.ts` - Core music theory data: emotion-to-chord matrix, extensions, flow chart nodes, continuance arcs
- `components/ChordCard.tsx` - Animated chord display card with tension meter
- `components/EmotionGrid.tsx` - 10-emotion selector grid
- `components/KeySelector.tsx` - Horizontal key selector (12 keys)
- `components/FlowChart.tsx` - Flow chart of continuance with chord functions and narrative arcs
- `components/SavedProgressions.tsx` - Saved progression list
- `app/(tabs)/index.tsx` - Generate screen (main randomizer)
- `app/(tabs)/story.tsx` - Story Progression screen (emotion order filter)
- `app/(tabs)/flow.tsx` - Flow of Continuance screen
- `app/(tabs)/saved.tsx` - Saved progressions screen

## Features
- 10 emotions mapped to chord progression templates
- 12 key centers
- Extensions (7ths, 9ths, 11ths, 13ths, altered) auto-assigned by emotion
- Narrative arc labels (setup, rising, climax, resolution, color)
- Solo extensions guide with playing hints
- Flow chart showing chord function relationships (tonic, subdominant, dominant, chromatic)
- 6 arcs of continuance with narration/voice/picture descriptions
- Emotion Order Filter Story Progression (Story tab):
  - 8 preset story arc templates (Hero's Journey, Tragedy, Rise & Fall, Romance, Redemption, Fever Dream, Coming of Age, Descent & Return)
  - Custom mode: build your own emotion sequence (2-8 emotions, reorderable)
  - Each emotion becomes a chapter with its own chord progression
  - Tension arc visualization showing story shape
  - Expandable chapter cards with chord details
  - Story roles auto-assigned (Opening, Development, Tension, Climax, Falling, Resolution)
- Fretboard diagrams for every chord (Generate tab horizontal scroll + Story tab expanded chapters)
- Save/delete favorite progressions

## Workflows
- `Start Backend`: `npm run server:dev` (port 5000)
- `Start Frontend`: `npm run expo:dev` (port 8081)
