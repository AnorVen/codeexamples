import { createSelector } from '@reduxjs/toolkit'

import { ProjectDTO } from 'api/base/api'

import { defaultSubtitleSettingsDTO } from 'store/project/constants'
import { compareSentenceOrder } from 'store/project/helpers'
import { RootState } from 'store/store'

export const projectSliceSelector = (state: RootState) => state.projectReducer

export const projectIndexActiveSelector = createSelector(projectSliceSelector, (state) => state.activeIndex)
export const projectIsSubtitleEditing = createSelector(projectSliceSelector, (state) => state.isSubtitleEditing)

export const projectDataSelector = createSelector(projectSliceSelector, (state) => state.projectData)

export const projectIsChangesLockedSelector = createSelector(projectSliceSelector, (state) => state.isChangesLocked)

export const projectLanguageSelector = createSelector(projectDataSelector, (projectData) => projectData?.language)

export const projectSubtitleSettingsSelector = createSelector(
  projectDataSelector,
  (projectData) => projectData?.subtitleSettings,
)

export const projectContentsSelector = createSelector(projectDataSelector, (projectData) => [
  ...(projectData?.contents || []),
])

export const projectAspectSelector = createSelector(projectDataSelector, (projectData) => String(projectData?.aspect))

export const projectTracksSelector = createSelector(projectDataSelector, (projectData) => [
  ...(projectData?.tracks || []),
])

export const projectSentencesSelector = createSelector(projectDataSelector, (projectData) => [
  ...(projectData?.sentences || []),
])

export const projectVoiceOverTypeSelector = createSelector(
  projectDataSelector,
  (projectData) => projectData?.voiceOverType === ProjectDTO.VoiceOverTypeEnum.AIGENERATED,
)

export const projectIdSelector = createSelector(projectDataSelector, (projectData) => projectData.id)

export const projectActiveModalTypeSelector = createSelector(projectSliceSelector, (state) => state.activeModalType)
export const projectIsSubtitlesEnableSelector = createSelector(projectDataSelector, (state) => state.enableSubtitles)

export const projectScriptModalDataSelector = createSelector(projectSliceSelector, (state) => state.scriptModalData)

export const projectScriptModalSentencesSelector = createSelector(projectScriptModalDataSelector, (scriptModalData) =>
  [...(scriptModalData?.sentences || [])].sort(compareSentenceOrder),
)

export const projectScriptModalSelectedSentenceIndexSelector = createSelector(
  projectScriptModalDataSelector,
  (state) => state?.selectedSentenceIndex,
)

export const projectScriptSubtitleSettingsSelector = (currentSubtitleIndex: number | undefined) =>
  createSelector(projectSentencesSelector, (sentences) => {
    const sentencesSettings = sentences.map((sentence) => ({
      ...sentence.subtitleSettings,
    }))
    if (typeof currentSubtitleIndex !== 'number' || currentSubtitleIndex === -1) return defaultSubtitleSettingsDTO
    return sentencesSettings[currentSubtitleIndex]
  })

export const projectScriptModalSubtitleSettingsSelector = createSelector(
  [projectScriptModalSentencesSelector, projectScriptModalSelectedSentenceIndexSelector],
  (sentences, selectedSentenceIndex) => {
    const sentencesSettings = sentences.map((sentence) => ({
      ...sentence.subtitleSettings,
    }))
    if (typeof selectedSentenceIndex !== 'number' || selectedSentenceIndex === -1) return defaultSubtitleSettingsDTO
    return sentencesSettings[selectedSentenceIndex]
  },
)

export const projectIsRegenerateNeededSelector = createSelector(projectSentencesSelector, (sentences) =>
  sentences.some((sentence) => sentence.regenerate),
)

export const projectContentModalDataSelector = createSelector(projectSliceSelector, (state) => state.contentModalData)

export const projectContentModalContentsSelector = createSelector(projectContentModalDataSelector, (state) => [
  ...(state?.contents || []),
])

export const projectContentModalSelectedContentIndexSelector = createSelector(
  projectContentModalDataSelector,
  (state) => state?.selectedContentIndex,
)

export const projectContentModalTypeSelector = createSelector(projectContentModalDataSelector, (state) => state?.type)

export const projectTrackModalDataSelector = createSelector(projectSliceSelector, (state) => state.trackModalData)

export const projectTrackModalTracksSelector = createSelector(projectTrackModalDataSelector, (state) => [
  ...(state?.tracks || []),
])

export const projectTrackModalSelectedTrackIndexSelector = createSelector(
  projectTrackModalDataSelector,
  (state) => state?.selectedTrackIndex,
)

export const projectIsProjectHaveErrorSelector = createSelector(
  projectSliceSelector,
  (state) => state.isProjectHaveError,
)
