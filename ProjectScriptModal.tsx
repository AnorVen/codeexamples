import { Col, Flex } from 'antd'
import React, { useState } from 'react'

import { SentenceDTO, SubtitleSettingsDTO } from 'api/base/api'

import { StyledButton, StyledSpace } from 'components/common'
import { DefaultModal } from 'components/defaultModal/DefaultModal'

import { SubtitlesPreview } from 'pages/project/subtitlesPreview/SubtitlesPreview'

import { initProjectPlayer } from 'store/actions/projectPlayer'
import { addSentence, deleteSentence, editSentence, moveSentence } from 'store/project/helpers'
import { projectImageOffsetByStartTimeSelector } from 'store/project/selectors/contents/utilities'
import {
  projectActiveModalTypeSelector,
  projectIsSubtitlesEnableSelector,
  projectScriptModalSelectedSentenceIndexSelector,
  projectScriptModalSentencesSelector,
  projectScriptModalSubtitleSettingsSelector,
  projectVoiceOverTypeSelector,
} from 'store/project/selectors/primitives'
import {
  projectScriptModalSelectedSubtitleOffsetsSelector,
  projectScriptModalSubtitleOffsetsSelector,
} from 'store/project/selectors/utilities'
import {
  setProjectIsSubtitlesEnabled,
  setProjectSentences,
  setScriptModalClose,
  setScriptModalSelectedSentenceIndex,
  setScriptModalSentences,
  setScriptModalSubtitleSettings,
} from 'store/project/slice'
import { useAppDispatch, useAppSelector } from 'store/redux'

import styles from 'pages/project/scriptModal/projectScriptModal.module.scss'

import { useRegenerateProject } from '../useRegenerateProject'
import { HeaderControls } from './HeaderControls/HeaderControls'
import { SentencesList } from './SentencesList/SentencesList'
import { SubtitlesGeneralSettings } from './SubtitlesGeneralSettings/SubtitlesGeneralSettings'
import { SubtitlesPositionSettings } from './SubtitlesPositionSettings/SubtitlesPositionSettings'

export const ProjectScriptModal: React.FC = () => {
  const dispatch = useAppDispatch()
  const activeModalType = useAppSelector(projectActiveModalTypeSelector)
  const sentences = useAppSelector(projectScriptModalSentencesSelector)
  const subtitleOffsets = useAppSelector(projectScriptModalSubtitleOffsetsSelector)
  const subtitlesSettings = useAppSelector(projectScriptModalSubtitleSettingsSelector) || {}
  const subtitles = useAppSelector(projectIsSubtitlesEnableSelector)
  const selectedSentenceIndex = useAppSelector(projectScriptModalSelectedSentenceIndexSelector)
  const voiceOverType = useAppSelector(projectVoiceOverTypeSelector)
  const [selectedLineIndex, setSelectedLineIndex] = useState<number>(0)
  const [isEdited, setIsEdited] = useState(false)
  const [lastSubtitle, setLastSubtitle] = useState<string>()
  const [isTextEdited, setIsTextEdited] = useState(false)

  const selectedSubtitleOffset = useAppSelector(
    projectScriptModalSelectedSubtitleOffsetsSelector(selectedSentenceIndex ?? 0, selectedLineIndex),
  )
  const imageOffset = useAppSelector(projectImageOffsetByStartTimeSelector(selectedSubtitleOffset?.startTime))

  const [editorText, setEditorText] = useState<string>()
  const selectedText =
    editorText !== undefined
      ? editorText
      : typeof selectedSentenceIndex === 'number'
        ? selectedSubtitleOffset?.text
        : lastSubtitle

  const { regenerateProject, isLoading: isRegenerating } = useRegenerateProject()

  const isModalOpen = activeModalType === 'script' && !!sentences && !!subtitleOffsets

  if (!isModalOpen) return null

  const dispatchSetScriptModalSubtitleSettings = (newSettings: SubtitleSettingsDTO) => {
    setIsEdited(true)
    dispatch(setScriptModalSubtitleSettings(newSettings))
  }

  const dispatchSetScriptModalSentences = (sentences: SentenceDTO[]) => dispatch(setScriptModalSentences(sentences))

  const setAreSubtitlesEnabled = (value: boolean) => {
    dispatch(setProjectIsSubtitlesEnabled(value))
    setIsEdited(true)
  }

  const onAddSentence = (to: number) => {
    setIsTextEdited(true)
    dispatchSetScriptModalSentences(addSentence(sentences, to))
    dispatch(setScriptModalSelectedSentenceIndex(to))
  }

  const onDeleteSentence = (index: number) => {
    setIsTextEdited(true)
    dispatchSetScriptModalSentences(deleteSentence(sentences, index))
  }

  const onSaveSentence = (sentence: SentenceDTO, index: number) => {
    if (sentence.text !== sentences[index].text) {
      setIsTextEdited(true)
    }
    setLastSubtitle(sentence.text)
    dispatchSetScriptModalSentences(editSentence(sentences, sentence, index))
    dispatch(setScriptModalSelectedSentenceIndex(undefined))
  }

  const onEditSentence = (index: number) => {
    dispatch(setScriptModalSelectedSentenceIndex(index))
  }

  const onCancelEditSentence = () => {
    dispatch(setScriptModalSelectedSentenceIndex(undefined))
  }

  const onMoveSentence = (from: number, to: number) => {
    setIsTextEdited(true)
    dispatchSetScriptModalSentences(moveSentence(sentences, from, to, voiceOverType))
  }

  const onCancel = () => {
    dispatch(setScriptModalClose())
  }

  const onRegenerateLater = () => {
    dispatch(setProjectSentences(sentences))
    dispatch(initProjectPlayer())
    dispatch(setScriptModalClose())
  }

  const onRegenerateNow = () => {
    dispatch(setScriptModalSelectedSentenceIndex(undefined))
    regenerateProject({
      sentences,
    })
    dispatch(setScriptModalClose())
  }

  const handleApplyToAllSubtitlesSettings = () => {
    setIsEdited(true)
    const newSentences = sentences.map((sentence) => ({ ...sentence, subtitleSettings: subtitlesSettings }))
    dispatch(setScriptModalSentences(newSentences))
  }

  const confirmProps = isTextEdited
    ? {
        title: "You've made changes that affect the voiceover. It will take time to regenerate it",
        description:
          'Do you want to regenerate the voiceover now or later, when all changes affecting the voiceover (e.g. pronunciation) are made?',
        onConfirm: onRegenerateLater,
        onCancel: onRegenerateNow,
        confirmActionLabel: 'Regenerate later',
        cancelActionLabel: 'Regenerate now',
        minWidth: 500,
      }
    : {}

  return (
    <DefaultModal
      title="Script"
      open={isModalOpen}
      onClose={onCancel}
      onSecondaryAction={onCancel}
      primaryActionDisabled={(!isTextEdited && !isEdited) || isRegenerating}
      primaryActionLabel="Save"
      primaryActionLoading={isRegenerating}
      secondaryActionDisabled={isRegenerating}
      minWidth={1556}
      headerControls={
        <HeaderControls areSubtitlesEnabled={subtitles} setAreSubtitlesEnabled={setAreSubtitlesEnabled} />
      }
      closable={false}
      onPrimaryAction={onRegenerateLater}
      confirmRequired={isTextEdited}
      confirmProps={confirmProps}
    >
      <Flex align="stretch" className={styles.contentWrapper}>
        <Col span={14}>
          <SentencesList
            selectedSentenceId={selectedSentenceIndex}
            sentences={sentences}
            onAdd={onAddSentence}
            onDelete={onDeleteSentence}
            onEdit={onEditSentence}
            onSave={onSaveSentence}
            onMove={onMoveSentence}
            onCancel={onCancelEditSentence}
            onChangeEditorText={setEditorText}
            onChangeEditorLine={(index) => setSelectedLineIndex(index ?? 0)}
          />
        </Col>
        <Col span={10}>
          <StyledSpace direction="vertical" size={20} style={{ width: '100%' }}>
            <SubtitlesPreview
              settings={subtitlesSettings}
              text={selectedText}
              url={imageOffset?.url || imageOffset?.thumbnailUrl}
              video={imageOffset?.video || false}
              subtitleStartTime={selectedSubtitleOffset?.startTime || 0}
            />

            <Flex align="stretch">
              <Col span={10}>
                <SubtitlesGeneralSettings
                  settings={subtitlesSettings}
                  setSettings={dispatchSetScriptModalSubtitleSettings}
                />
              </Col>
              <Col span={14}>
                <SubtitlesPositionSettings
                  settings={subtitlesSettings}
                  setSettings={dispatchSetScriptModalSubtitleSettings}
                />
                <Flex justify="space-between" style={{ marginTop: '34px' }}>
                  <StyledButton type="filled" onClick={handleApplyToAllSubtitlesSettings}>
                    Apply to all scenes
                  </StyledButton>
                </Flex>
              </Col>
            </Flex>
          </StyledSpace>
        </Col>
      </Flex>
    </DefaultModal>
  )
}
