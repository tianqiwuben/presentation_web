
import React,{Component} from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import SpinnerWithLabel from './SpinnerWithLabel';
import clsx from 'clsx';
import { Typography } from '@material-ui/core';
import {uploadFile, getPitch} from '../utils/apis';
import styles from './pitchPile.module.css';
import {PITCH_STATUS, PULL_INTERVAL} from '../utils/constants';
import { withSnackbar } from 'notistack';
class PitchPile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      progress: 0,
    }
  }

  pullPitch = () => {
    const {pitch} = this.props;
    this.timeout = null;
    getPitch(pitch.id, 'grid').then(resp => {
      if (resp.data.payload.status === PITCH_STATUS.done) {
        const {onUpdatePitch} = this.props;
        onUpdatePitch(pitch, resp.data.payload);
      } else {
        this.timeout = setTimeout(this.pullPitch, PULL_INTERVAL);
      }
    }).catch(error => {
      const {enqueueSnackbar} = this.props;
      enqueueSnackbar(error.message, {variant: 'error'});
    })
  }

  componentDidMount() {
    const {pitch} = this.props;
    if (pitch.status === PITCH_STATUS.uploading && pitch.file) {
      uploadFile(pitch.file, progress => {
        if (progress < 100) {
          this.setState({
            progress: progress,
          })
        }
      }).then(resp => {
        const {onUpdatePitch} = this.props;
        onUpdatePitch(pitch, resp.data.payload);
      }).catch(error => {
        const {enqueueSnackbar} = this.props;
        enqueueSnackbar(error.message, {variant: 'error'});
      });
    } else if (pitch.status !== PITCH_STATUS.done) {
      this.timeout = setTimeout(this.pullPitch, PULL_INTERVAL);
    }
  }

  componentWillUnmount() {
    this.timeout && clearTimeout(this.timeout);
  }

  onSelect = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const {onSelectFile, pitch} = this.props;
    onSelectFile(pitch);
  }


  render() {
    const {pitch, selected} = this.props;
    const {progress} = this.state;
    if (pitch.status !== PITCH_STATUS.done) {
      return (
        <div className={styles.loadingGrid} >
          {
            pitch.status === PITCH_STATUS.uploading ?
            <SpinnerWithLabel value={progress} />
            :
            <CircularProgress />
          }
          <Typography variant="body1">{pitch.status === PITCH_STATUS.uploading ? 'Uploading' : 'Processing'}</Typography>
        </div>
      )
    }
    return (
      <div
        className={styles.gridPile} 
        onClick={this.onSelect}
      >
        <img src={pitch.thumb_url} />
        <div className={clsx({
            [styles.gridInfo]: true,
            [styles.gridSelected]: selected,
          })}
        >
          <Typography variant="body1" align="center" noWrap>
            {pitch.filename}
          </Typography>
        </div>
      </div>
    )
  }
}

export default withSnackbar(PitchPile);

