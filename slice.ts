import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

import {
  AtvTaskDTO,
  ContentDTO,
  GraphicLayerDTO,
  MusicDTO,
  ProjectDTO,
  SentenceDTO,
  SubtitleSettingsDTO,
  TrackDTO,
} from 'api/base/api.ts'

import { projectApiService } from 'store/project/apiService'

import { addContent, addLayer, addLayerItem, addSentence, addTrack, calculateOrdering, mockGraphics } from './helpers'
import { ContentModalData, GraphicLayerItemModalData, ProjectModalType, ScriptModalData, TrackModalData } from './types'

import AspectEnum = ProjectDTO.AspectEnum
import StatusEnum = ProjectDTO.StatusEnum

export interface ProjectState {
  projectData: ProjectDTO
  isChangesLocked: boolean
  activeModalType: ProjectModalType
  activeIndex: number | undefined
  scriptModalData: ScriptModalData | undefined
  contentModalData: ContentModalData | undefined
  graphicLayerItemModalData: GraphicLayerItemModalData | undefined
  trackModalData: TrackModalData | undefined
  isProjectHaveError: boolean
  isSubtitleEditing: boolean
}

const initialState: ProjectState = {
  projectData: {
    name: '',
    length: 0,
    articleUrl: '',
    language: ProjectDTO.LanguageEnum.ENGLISH,
    // eslint-disable-next-line no-underscore-dangle
    aspect: AspectEnum._16BY9,
    status: StatusEnum.INPROGRESS,
    graphics: [...mockGraphics],
    enableSubtitles: true,
  },
  isChangesLocked: false,
  activeModalType: undefined,
  activeIndex: undefined,

  scriptModalData: undefined,
  contentModalData: undefined,
  isProjectHaveError: false,
  trackModalData: undefined,
  isSubtitleEditing: false,
  graphicLayerItemModalData: undefined,
}

export const projectSlice = createSlice({
  name: 'Project',
  initialState,
  reducers: {
    setIsSubtitleEditing: (state, action: PayloadAction<boolean>) => {
      state.isSubtitleEditing = action.payload
    },
    setActiveModalType: (state, action: PayloadAction<ProjectModalType>) => {
      state.activeModalType = action.payload
    },
    setActiveIndex: (state, action: PayloadAction<number | undefined>) => {
      state.activeIndex = action.payload
    },
    setLocalProjectData: (state, action: PayloadAction<ProjectDTO>) => {
      state.projectData = { ...action.payload, graphics: [...mockGraphics] }
    },
    setLocalProjectName: (state, action: PayloadAction<string>) => {
      state.projectData.name = action.payload
    },
    setProjectIsSubtitlesEnabled: (state, action: PayloadAction<boolean>) => {
      state.projectData.enableSubtitles = action.payload
    },
    setProjectContents: (state, action: PayloadAction<ContentDTO[]>) => {
      state.projectData.contents = action.payload
    },
    setProjectSentences: (state, action: PayloadAction<SentenceDTO[]>) => {
      state.projectData.sentences = action.payload.map((sentence) => ({
        ...sentence,
        voiceOver: {
          ...sentence.voiceOver,
          startTime: sentence.startTime,
          duration: sentence.duration,
        },
      }))
    },
    setProjectMusics: (state, action: PayloadAction<TrackDTO[]>) => {
      state.projectData.tracks = action.payload
    },
    setProjectGraphics: (state, action: PayloadAction<GraphicLayerDTO[]>) => {
      state.projectData.graphics = action.payload
    },
    setProjectSubtitlesSettings: (state, action: PayloadAction<SubtitleSettingsDTO | undefined>) => {
      state.projectData.subtitleSettings = action.payload
    },
    setIsChangesLocked: (state, action: PayloadAction<boolean>) => {
      state.isChangesLocked = action.payload
    },
    setScriptModalOpen: (state, action: PayloadAction<{ selectedSentenceIndex: number; newSentence?: boolean }>) => {
      if (!state.projectData?.sentences) return

      const { selectedSentenceIndex, newSentence = false } = action.payload
      const sentences = newSentence
        ? addSentence(state.projectData.sentences, selectedSentenceIndex)
        : [...state.projectData.sentences]

      state.scriptModalData = {
        selectedSentenceIndex,
        selectedLineIndex: 0,
        sentences,
      }
      if (newSentence) {
        state.isSubtitleEditing = true
      }
      state.activeModalType = 'script'
    },
    setScriptModalClose: (state) => {
      state.scriptModalData = undefined
      state.activeModalType = undefined
    },
    setScriptModalSentences: (state, action: PayloadAction<SentenceDTO[]>) => {
      if (!state.scriptModalData) return
      state.scriptModalData.sentences = action.payload
    },
    setScriptModalSubtitleSettings: (state, action: PayloadAction<SubtitleSettingsDTO>) => {
      if (!state.scriptModalData) return
      const { selectedSentenceIndex } = state.scriptModalData
      if (typeof selectedSentenceIndex !== 'number') return
      state.scriptModalData.sentences[selectedSentenceIndex].subtitleSettings = action.payload
    },
    setScriptModalSelectedSentenceIndex: (state, action: PayloadAction<number | undefined>) => {
      if (!state.scriptModalData) return
      state.scriptModalData.selectedSentenceIndex = action.payload
    },
    setContentModalOpen: (state, action: PayloadAction<{ selectedContentIndex: number; newContent?: boolean }>) => {
      if (!state.projectData?.contents) return

      const { selectedContentIndex, newContent = false } = action.payload

      const contents = newContent
        ? addContent(state.projectData.contents, selectedContentIndex)
        : [...state.projectData.contents]

      state.contentModalData = {
        selectedContentIndex,
        contents,
        type: 'all',
      }

      state.activeModalType = 'visual'
    },
    setContentModalClose: (state) => {
      state.contentModalData = undefined
      state.activeModalType = undefined
    },
    setContentModalContents: (state, action: PayloadAction<ContentDTO[]>) => {
      if (!state.contentModalData) return
      state.contentModalData.contents = action.payload
    },
    setContentModalType: (state, action: PayloadAction<ContentModalData['type']>) => {
      if (!state.contentModalData) return
      state.contentModalData.type = action.payload
    },
    setContentModalSelectedContentIndex: (state, action: PayloadAction<number>) => {
      if (!state.contentModalData) return
      state.contentModalData.selectedContentIndex = action.payload
    },
    setTrackModalOpen: (state, action: PayloadAction<{ selectedTrackIndex: number; newTrack?: boolean }>) => {
      if (!state.projectData?.tracks) return

      const { selectedTrackIndex, newTrack = false } = action.payload

      const tracks = newTrack ? addTrack(state.projectData.tracks, selectedTrackIndex) : [...state.projectData.tracks]

      state.trackModalData = {
        selectedTrackIndex,
        tracks,
      }

      state.activeModalType = 'music'
    },
    setTrackModalClose: (state) => {
      state.trackModalData = undefined
      state.activeModalType = undefined
    },
    setTrackModalTracks: (state, action: PayloadAction<TrackDTO[]>) => {
      if (!state.trackModalData) return
      state.trackModalData.tracks = action.payload
    },
    setTrackModalSelectedTrackIndex: (state, action: PayloadAction<number>) => {
      if (!state.trackModalData) return
      state.trackModalData.selectedTrackIndex = action.payload
    },
    setTrackModalVolume: (state, action: PayloadAction<number>) => {
      if (!state.trackModalData || state.trackModalData.selectedTrackIndex === undefined) return
      state.trackModalData.tracks[state.trackModalData.selectedTrackIndex] = {
        ...state.trackModalData.tracks[state.trackModalData.selectedTrackIndex],
        volume: action.payload,
      }
    },
    setTrackModalSelectedMusic: (state, action: PayloadAction<MusicDTO | undefined>) => {
      if (!state.trackModalData || state.trackModalData.selectedTrackIndex === undefined) return

      const item = state.trackModalData.tracks[state.trackModalData.selectedTrackIndex]
      state.trackModalData.tracks[state.trackModalData.selectedTrackIndex] = {
        ...item,
        music: action.payload,
        duration: item.duration || action.payload?.duration || 15000,
      }

      if (action.payload && !item.duration) {
        state.trackModalData.tracks = calculateOrdering(state.trackModalData.tracks)
      }
    },
    setGraphicItemModalOpen: (
      state,
      action: PayloadAction<{
        selectedLayerIndex: number
        selectedItemIndex: number
        newItem?: boolean
        newLayer?: boolean
      }>,
    ) => {
      if (!state.projectData?.graphics) return

      const { selectedLayerIndex, selectedItemIndex, newItem = false, newLayer = false } = action.payload

      const layers = newLayer
        ? addLayer([...(state.projectData.graphics || [])], selectedLayerIndex)
        : state.projectData.graphics

      const selectedLayer = layers[selectedLayerIndex]
      if (!selectedLayer) return

      const items = newItem
        ? addLayerItem([...(selectedLayer.items || [])], selectedItemIndex)
        : [...(selectedLayer.items || [])]

      state.graphicLayerItemModalData = {
        selectedItemIndex,
        items,
        selectedLayerId: selectedLayer.id || `new_${uuidv4()}`,
      }

      state.activeModalType = 'graphic'
    },
    setGraphicItemModalClose: (state) => {
      state.graphicLayerItemModalData = undefined
      state.activeModalType = undefined
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(projectApiService.endpoints.getProjectData.matchFulfilled, (_, { payload }) => {
        if (payload.id && payload?.status && payload?.status !== StatusEnum.VIDEODONE) {
          projectApiService.endpoints.getProjectStatus.initiate(payload.id as string)
        }
      })
      .addMatcher(projectApiService.endpoints.getProjectStatus.matchFulfilled, (state, { payload }) => {
        if (
          payload?.status &&
          (payload?.status === AtvTaskDTO.StatusEnum.ERROR || payload?.status === AtvTaskDTO.StatusEnum.IGNORED)
        ) {
          state.isProjectHaveError = true
        }
      })
  },
})

export default projectSlice.reducer
export const {
  setActiveIndex,
  setActiveModalType,
  setContentModalClose,
  setContentModalContents,
  setContentModalOpen,
  setContentModalSelectedContentIndex,
  setContentModalType,
  setGraphicItemModalClose,
  setGraphicItemModalOpen,
  setIsChangesLocked,
  setLocalProjectData,
  setLocalProjectName,
  setProjectContents,
  setProjectGraphics,
  setProjectMusics,
  setProjectSentences,
  setProjectSubtitlesSettings,
  setScriptModalClose,
  setScriptModalOpen,
  setScriptModalSelectedSentenceIndex,
  setScriptModalSentences,
  setScriptModalSubtitleSettings,
  setTrackModalClose,
  setTrackModalOpen,
  setTrackModalSelectedMusic,
  setTrackModalSelectedTrackIndex,
  setTrackModalTracks,
  setTrackModalVolume,
  setIsSubtitleEditing,
  setProjectIsSubtitlesEnabled,
} = projectSlice.actions
