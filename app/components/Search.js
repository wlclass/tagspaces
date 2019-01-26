/**
 * TagSpaces - universal file and folder organizer
 * Copyright (C) 2017-present TagSpaces UG (haftungsbeschraenkt)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License (version 3) as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * @flow
 */

import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import PictureIcon from '@material-ui/icons/Panorama';
import DocumentIcon from '@material-ui/icons/PictureAsPdf';
import NoteIcon from '@material-ui/icons/Note';
import AudioIcon from '@material-ui/icons/MusicVideo';
import VideoIcon from '@material-ui/icons/OndemandVideo';
import ArchiveIcon from '@material-ui/icons/Archive';
import FolderIcon from '@material-ui/icons/FolderOpen';
import UntaggedIcon from '@material-ui/icons/LabelOffOutlined';
import FileIcon from '@material-ui/icons/InsertDriveFileOutlined';
import ClearSearchIcon from '@material-ui/icons/Clear';
import BookmarkIcon from '@material-ui/icons/BookmarkBorder';
import BookIcon from '@material-ui/icons/LocalLibraryOutlined';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import TagsSelect from './TagsSelect';
import CustomLogo from './CustomLogo';
import { actions as AppActions, getDirectoryPath } from '../reducers/app';
import { actions as LocationIndexActions, getIndexedEntriesCount, isIndexing } from '../reducers/location-index';
import { getMaxSearchResults } from '../reducers/settings';
import styles from './SidePanels.css';
import i18n from '../services/i18n';
import { FileTypeGroups, type SearchQuery } from '../services/search';
import { Pro } from '../pro';
import type { Tag } from '../reducers/taglibrary';

type Props = {
  classes: Object,
  style: Object,
  searchLocationIndex: (searchQuery: SearchQuery) => void,
  loadDirectoryContent: (path: string) => void,
  currentDirectory: string,
  indexedEntriesCount: number,
  maxSearchResults: number,
  indexing: boolean
};

type State = {
  textQuery?: string,
  tagsAND?: Array<Tag>,
  tagsOR?: Array<Tag>,
  tagsNOT?: Array<Tag>,
  fileTypes?: Array<string>,
  lastModified?: Date | string
};

class Search extends React.Component<Props, State> {
  state = {
    textQuery: '',
    tagsAND: [],
    tagsOR: [],
    tagsNOT: [],
    fileTypes: FileTypeGroups.any,
    lastModified: ''
  };

  handleInputChange = event => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  };

  startSearch = event => {
    if (event.key === 'Enter' || event.keyCode === 13) {
      this.executeSearch();
    }
  };

  clearSearch = () => {
    this.setState(
      {
        textQuery: '',
        tagsAND: [],
        tagsOR: [],
        tagsNOT: [],
        fileTypes: FileTypeGroups.any
      },
      () => this.props.loadDirectoryContent(this.props.currentDirectory)
    );
  };

  executeSearch = () => {
    const searchQuery: SearchQuery = {
      textQuery: this.state.textQuery,
      fileTypes: this.state.fileTypes,
      tagsAND: this.state.tagsAND,
      tagsOR: this.state.tagsOR,
      tagsNOT: this.state.tagsNOT,
      maxSearchResults: this.props.maxSearchResults
    };
    console.log('Search object: ' + JSON.stringify(searchQuery));
    this.props.searchLocationIndex(searchQuery);
  };

  handleChange = (name, value) => {
    this.setState({
      [name]: value
    });
  };

  render() {
    const { classes, indexing, indexedEntriesCount } = this.props;
    return (
      <div className={classes.panel} style={this.props.style}>
        <CustomLogo />
        <div className={classes.toolbar}>
          <Typography className={classes.panelTitle}>
            {i18n.t('searchTitle')}
          </Typography>
        </div>
        <div className={classes.searchArea}>
          <Typography variant="caption">
            {indexing ? 'indexing...' : 'indexed ' + indexedEntriesCount + ' entries'}
          </Typography>
          <FormControl
            className={classes.formControl}
            disabled={indexing}
          >
            <InputLabel htmlFor="textQuery">
              {i18n.t('searchPlaceholder')}
            </InputLabel>
            <Input
              id="textQuery"
              name="textQuery"
              value={this.state.textQuery}
              onChange={this.handleInputChange}
              onKeyDown={this.startSearch}
              placeholder={i18n.t('core:searchWordsWithInterval')}
              endAdornment={
                /* (this.state.textQuery && this.state.textQuery.length > 0) && */
                <InputAdornment position="end">
                  <IconButton onClick={this.clearSearch}>
                    <ClearSearchIcon />
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
          <Typography variant="caption" style={{ marginTop: 10 }}>
            {i18n.t('core:mustContainTheseTags')}
          </Typography>
          <FormControl
            className={classes.formControl}
            disabled={indexing}
          >
            <TagsSelect tags={this.state.tagsAND} handleChange={this.handleChange} tagSearchType={'tagsAND'} />
          </FormControl>
          <Typography variant="caption" style={{ marginTop: 10 }}>
            {i18n.t('core:atLeastOneOfTheseTags')}
          </Typography>
          <FormControl
            className={classes.formControl}
            disabled={indexing}
          >
            <TagsSelect tags={this.state.tagsOR} handleChange={this.handleChange} tagSearchType={'tagsOR'} />
          </FormControl>
          <Typography variant="caption" style={{ marginTop: 10 }}>
            {i18n.t('core:noneOfTheseTags')}
          </Typography>
          <FormControl
            className={classes.formControl}
            disabled={indexing}
          >
            <TagsSelect tags={this.state.tagsNOT} handleChange={this.handleChange} tagSearchType={'tagsNOT'} />
          </FormControl>
          <FormControl
            className={classes.formControl}
            disabled={indexing || !Pro}
            title={i18n.t('core:thisFunctionalityIsAvailableInPro')}
          >
            <InputLabel htmlFor="file-type">{i18n.t('core:fileType')}</InputLabel>
            <Select
              value={this.state.fileTypes}
              onChange={this.handleInputChange}
              input={<Input name="fileTypes" id="file-type" />}
            >
              <MenuItem value={FileTypeGroups.any}>
                {i18n.t('core:anyType')}
              </MenuItem>
              <MenuItem value={FileTypeGroups.folders}>
                <IconButton>
                  <FolderIcon />
                </IconButton>
                {i18n.t('core:searchFolders')}
              </MenuItem>
              <MenuItem value={FileTypeGroups.files}>
                <IconButton>
                  <FileIcon />
                </IconButton>
                {i18n.t('core:searchFiles')}
              </MenuItem>
              <MenuItem value={FileTypeGroups.untagged}>
                <IconButton>
                  <UntaggedIcon />
                </IconButton>
                {i18n.t('core:searchUntaggedEntries')}
              </MenuItem>
              <MenuItem
                value={FileTypeGroups.images}
                title={FileTypeGroups.images.toString()}
              >
                <IconButton>
                  <PictureIcon />
                </IconButton>
                {i18n.t('core:searchPictures')}
              </MenuItem>
              <MenuItem
                value={FileTypeGroups.documents}
                title={FileTypeGroups.documents.toString()}
              >
                <IconButton>
                  <DocumentIcon />
                </IconButton>
                {i18n.t('core:searchDocuments')}
              </MenuItem>
              <MenuItem
                value={FileTypeGroups.notes}
                title={FileTypeGroups.notes.toString()}
              >
                <IconButton>
                  <NoteIcon />
                </IconButton>
                {i18n.t('core:searchNotes')}
              </MenuItem>
              <MenuItem
                value={FileTypeGroups.audio}
                title={FileTypeGroups.audio.toString()}
              >
                <IconButton>
                  <AudioIcon />
                </IconButton>
                {i18n.t('core:searchAudio')}
              </MenuItem>
              <MenuItem
                value={FileTypeGroups.video}
                title={FileTypeGroups.video.toString()}
              >
                <IconButton>
                  <VideoIcon />
                </IconButton>
                {i18n.t('core:searchVideoFiles')}
              </MenuItem>
              <MenuItem
                value={FileTypeGroups.archives}
                title={FileTypeGroups.archives.toString()}
              >
                <IconButton>
                  <ArchiveIcon />
                </IconButton>
                {i18n.t('core:searchArchives')}
              </MenuItem>
              <MenuItem
                value={FileTypeGroups.bookmarks}
                title={FileTypeGroups.bookmarks.toString()}
              >
                <IconButton>
                  <BookmarkIcon />
                </IconButton>
                {i18n.t('core:searchBookmarks')}
              </MenuItem>
              <MenuItem
                value={FileTypeGroups.ebooks}
                title={FileTypeGroups.ebooks.toString()}
              >
                <IconButton>
                  <BookIcon />
                </IconButton>
                {i18n.t('core:searchEbooks')}
              </MenuItem>
            </Select>
            {/* <FormHelperText>{i18n.t('core:searchFileTypes')}</FormHelperText> */}
          </FormControl>
          {/*  <FormControl
            className={classes.formControl}
            disabled={true}
            title={i18n.t('core:thisFunctionalityIsAvailableInPro')}
          >
            <InputLabel htmlFor="modification-date">{i18n.t('core:modifiedDate')}</InputLabel>
            <Select
              value={this.state.lastModified}
              onChange={this.handleInputChange}
              input={<Input name="lastModified" id="modification-date" />}
            >
              <MenuItem value="">
                {i18n.t('core:anyTime')}
              </MenuItem>
              <MenuItem value={(new Date())}>
                {i18n.t('core:today')}
              </MenuItem>
              <MenuItem value={(new Date())}>
                {i18n.t('core:yesterday')}
              </MenuItem>
              <MenuItem value={(new Date())}>
                {i18n.t('core:oneWeekAgo')}
              </MenuItem>
              <MenuItem value={(new Date())}>
                {i18n.t('core:oneMonthAgo')}
              </MenuItem>
              <MenuItem value={(new Date())}>
                {i18n.t('core:halfAnYearAgo')}
              </MenuItem>
              <MenuItem value={(new Date())}>
                {i18n.t('core:anYearAgo')}
              </MenuItem>
            </Select>
            <FormHelperText>{i18n.t('')}</FormHelperText>
          </FormControl> */ }
          { /* <FormControl
            className={classes.formControl}
            disabled={true}
            title={i18n.t('core:thisFunctionalityIsAvailableInPro')}
          >
            <InputLabel htmlFor="searchHistory">{i18n.t('core:searchHistory')}</InputLabel>
            <Input id="searchHistory" />
            <FormHelperText>{i18n.t('core:chooseSearchQuery')}</FormHelperText>
          </FormControl> */}
          <FormControl className={classes.formControl}>
            <Button
              disabled={indexing}
              id="searchButton"
              variant="outlined"
              size="small"
              color="primary"
              onClick={this.executeSearch}
            >
              {indexing ? 'Search disabled while indexing' : i18n.t('searchTitle')}
            </Button>&nbsp;
            <Button
              size="small"
              color="primary"
              onClick={this.clearSearch}
              id="resetSearchButton"
            >
              {i18n.t('resetBtn')}
            </Button>
          </FormControl>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    indexing: isIndexing(state),
    currentDirectory: getDirectoryPath(state),
    indexedEntriesCount: getIndexedEntriesCount(state),
    maxSearchResults: getMaxSearchResults(state)
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    searchLocationIndex: LocationIndexActions.searchLocationIndex,
    loadDirectoryContent: AppActions.loadDirectoryContent
  }, dispatch);
}

export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(Search)
);
