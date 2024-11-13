import React, { useState } from 'react'
import { useParams } from 'react-router-dom'

import { ProjectContainer } from 'components/appContainers/project'

import { ProjectContentModal } from 'pages/project/contentModal/ProjectContentModal'
import { ProjectContentTrack } from 'pages/project/contentTrack/ProjectContentTrack'
import { ProjectDeleteModal } from 'pages/project/deleteModal/ProjectDeleteModal'
import { ProjectExportModal } from 'pages/project/exportModal/ProjectExportModal'
import { ProjectInfoModal } from 'pages/project/infoModal/ProjectInfoModal.tsx'
import { ProjectScriptModal } from 'pages/project/scriptModal/ProjectScriptModal'
import { ScriptTrack } from 'pages/project/scriptTrack/ScriptTrack'
import { MusicModal } from 'pages/project/soundModals/MusicModal'
import { VoiceModal } from 'pages/project/soundModals/VoiceModal.tsx'
import { VoiceSelectionModal } from 'pages/project/soundModals/VoiceSelectionModal.tsx'
import { MusicTrack } from 'pages/project/soundTracks/MusicTrack'
import { VoiceTrack } from 'pages/project/soundTracks/VoiceTrack'
import { TruncatedModal } from 'pages/project/truncatedModal/TruncatedModal.tsx'
import { useProjectData } from 'pages/project/useProjectData'

import {
  projectActiveModalTypeSelector,
  projectIndexActiveSelector,
  projectIsChangesLockedSelector,
  projectIsProjectHaveErrorSelector,
  projectIsRegenerateNeededSelector,
  projectVoiceOverTypeSelector,
} from 'store/project/selectors/primitives'
import { setActiveIndex, setActiveModalType } from 'store/project/slice'
import { useAppDispatch, useAppSelector } from 'store/redux'

import { BoardContainer } from './board/BoardContainer'
import { ProjectGraphicModal } from './graphicsModal/GraphicsModal'
import { GraphicsTrack } from './graphicsTrack/GraphicsTrack'
import SlideShow from './slideShow/Slideshow2'
import { usePreviewPlayer } from './usePreviewPlayer'

export const Project: React.FC = () => {
  const dispatch = useAppDispatch()
  const activeModalType = useAppSelector(projectActiveModalTypeSelector)
  const { id } = useParams<{ id: string }>()
  const { isLoading, projectData, isChangesLocked: isInitiallyLocked } = useProjectData(id)
  const isChangesLocked = useAppSelector(projectIsChangesLockedSelector)
  const isRegenerateNeeded = useAppSelector(projectIsRegenerateNeededSelector)
  const indexActive = useAppSelector(projectIndexActiveSelector)
  const isProjectHaveError = useAppSelector(projectIsProjectHaveErrorSelector)
  const voiceOverType = useAppSelector(projectVoiceOverTypeSelector)

  usePreviewPlayer()

  const [isTruncatedModalOpen, setIsTruncatedModalOpen] = useState(false)

  const onCloseModal = () => {
    dispatch(setActiveModalType(undefined))
    dispatch(setActiveIndex(undefined))
  }

  const handleOpenVoiceModal = (sentenceIndex: number) => {
    dispatch(setActiveModalType('voice'))
    dispatch(setActiveIndex(sentenceIndex))
  }

  const handleOpenVoiceSelectModal = (sentenceIndex: number) => {
    dispatch(setActiveModalType('voice-select'))
    dispatch(setActiveIndex(sentenceIndex))
  }

  const onVoiceSelectClose = (sentenceIndex: number) => {
    dispatch(setActiveModalType('voice'))
    dispatch(setActiveIndex(sentenceIndex))
  }
  return (
    <ProjectContainer
      isLoading={isLoading}
      exportDisabled={isChangesLocked || isInitiallyLocked || isRegenerateNeeded || isProjectHaveError}
      openExportModal={() => dispatch(setActiveModalType('export'))}
      openDeleteModal={() => dispatch(setActiveModalType('delete'))}
      openInfoModal={() => dispatch(setActiveModalType('info'))}
    >
      <SlideShow
        isLoading={isChangesLocked || isInitiallyLocked || isProjectHaveError}
        loadingMessage={isProjectHaveError ? 'The video could not be generated' : 'Generating'}
      />
      <BoardContainer disabled={isChangesLocked || isInitiallyLocked || isProjectHaveError}>
        <ProjectContentTrack />
        <ScriptTrack />
        {voiceOverType && <VoiceTrack openModal={handleOpenVoiceModal} />}
        <MusicTrack />
        <GraphicsTrack />
      </BoardContainer>

      {activeModalType === 'visual' && <ProjectContentModal />}

      {activeModalType === 'script' && <ProjectScriptModal />}

      {activeModalType === 'graphic' && <ProjectGraphicModal />}

      <VoiceModal
        sentenceIndexActive={indexActive}
        open={activeModalType === 'voice'}
        onClose={onCloseModal}
        handleOpenVoiceSelectModal={handleOpenVoiceSelectModal}
      />

      <VoiceSelectionModal
        sentenceIndexActive={0}
        open={activeModalType === 'voice-select'}
        onBack={onVoiceSelectClose}
      />

      {activeModalType === 'music' && <MusicModal />}

      <ProjectExportModal open={activeModalType === 'export'} onClose={onCloseModal} />

      <TruncatedModal isOpen={isTruncatedModalOpen} setIsOpen={setIsTruncatedModalOpen} projectData={projectData} />

      <ProjectDeleteModal isOpen={activeModalType === 'delete'} setIsOpen={onCloseModal} projectData={projectData} />

      <ProjectInfoModal open={activeModalType === 'info'} onClose={onCloseModal} projectData={projectData} />
    </ProjectContainer>
  )
}
