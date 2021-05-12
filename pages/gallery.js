import Head from 'next/head';
import React,{Component} from 'react';
import Layout from '../components/layout';
import Button from '@material-ui/core/Button';
import Styles from './gallery.module.css';
import Spinner from '../components/spinner';
import IconButton from '@material-ui/core/IconButton';
import Box from '@material-ui/core/Box';
import DeleteIcon from '@material-ui/icons/Delete';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import VisibilityIcon from '@material-ui/icons/Visibility';
import Link from 'next/link';
import { withRouter } from 'next/router'

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import PitchPile from '../components/pitchPile';
import Pagination from '@material-ui/lab/Pagination';

 


import Toolbar from '@material-ui/core/Toolbar';
import {getAllPitches, deletePitch} from '../utils/apis';
import {PITCH_STATUS} from '../utils/constants';

class Gallery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null,
      uploadStatus: -1,
      loading: true,
      downloadUrl: "",
      pitches: [],
      lastClickTs: 0,
      openDelete: false,
      page: 1,
      totalPages: 1,
    }
    this.loadingPitches = false;
  }

  onFileChange = event => {
    // Update the state
    const {pitches} = this.state;
    const newPitches = [...pitches];
    const newId = -Date.now();
    const file = event.target.files[0];
    newPitches.unshift({id: newId, status: PITCH_STATUS.uploading, file: file});
    this.setState({
      pitches: newPitches,
    })
    event.target.value = null;
    this.gridContainer.scrollTo(0,0);
  };

  onUpdatePitch = (ori, updated) => {
    const {pitches} = this.state;
    const cleanPitches = [...pitches];
    for(let i = 0; i < cleanPitches.length; i++) {
      if (cleanPitches[i].id === ori.id) {
        cleanPitches.splice(i, 1, updated);
        this.setState({
          pitches: cleanPitches
        })
        break;
      }
    }
  }

  nextPage = () => {
    if (!this.loadingPitches) {
      const {page, totalPages} = this.state;
      if (page > totalPages) {
        return;
      }
      this.loadingPitches = true;
      getAllPitches(page).then(resp => {
        const {pitches} = this.state;
        const newPitches = [...resp.data.payload.items];
        for(let i = pitches.length - 1; i >= 0; i--) {
          let hasDup = false;
          for (const item of resp.data.payload.items) {
            if (item.id === pitches[i].id) {
              hasDup = true;
              break;
            }
          }
          if (!hasDup) {
            newPitches.unshift(pitches[i]);
          }
        }
        this.setState({
          pitches: newPitches,
          loading: false,
          totalPages: resp.data.payload.total_pages,
          page: page + 1,
        }, () => {
          this.loadingPitches = false;
        })
      }).catch(error => {
        this.loadingPitches = false;
      })
    }
  }

  componentDidMount() {
    this.nextPage();
  }

  onSelectFile = (f) => {
    const {selectedFile, lastClickTs} = this.state;
    const nowTs = Date.now();
    if (selectedFile && selectedFile.id === f.id) {
      if (nowTs - lastClickTs < 500) {
        const {router} = this.props;
        router.push(`/invest?pitchId=${f.id}`);
      } else {
        this.setState({
          lastClickTs: nowTs,
        });
      }
    } else {
      this.setState({
        selectedFile: f,
        lastClickTs: nowTs,
      });
    }
  }

  deselect = () => {
    this.setState({
      selectedFile: null
    })
  }

  onDeleteFile = () => {
    const {selectedFile, pitches} = this.state;
    this.setState({
      openDelete: false,
    })
    deletePitch(selectedFile.id).then(resp => {
      const newPitches = [...pitches];
      for(let i = 0; i < pitches.length; i++) {
        if (pitches[i].id === selectedFile.id) {
          newPitches.splice(i, 1);
          break;
        }
      }
      this.setState({
        pitches: newPitches,
      })
    }).catch(error => {
    })
  }

  closeDelete = () => {
    this.setState({openDelete: false});
  }

  onGridScroll = (e) => {
    if (e.target.scrollTop + e.target.offsetHeight >= e.target.scrollHeight - 300) {
      this.nextPage();
    }
  }

  render() {
    const {
      loading,
      pitches,
      selectedFile,
      openDelete,
      page,
      totalPages,
    } = this.state;
    return (
      <Layout>
        <Head>
          <title>Gallery</title>
        </Head>
        <main>
          <Toolbar>
            <Box ml={2} mr={2}>
              <Button
                variant="outlined"
                color="primary"
                component="label"
                m={10}
              >
                UPLOAD
                <input
                  type="file"
                  accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint"
                  hidden
                  onChange={this.onFileChange}
                />
              </Button>
            </Box>
            {
              selectedFile && 
              <div className={Styles.iconBar}>
                <IconButton onClick={() => this.setState({openDelete: true})}>
                  <DeleteIcon />
                </IconButton>
                <Link href={selectedFile.download_url}>
                  <a>
                    <IconButton>
                      <CloudDownloadIcon />
                    </IconButton>
                  </a>
                </Link>
                <Link href={`/invest?pitchId=${selectedFile.id}`}>
                  <a>
                    <IconButton>
                      <VisibilityIcon />
                    </IconButton>
                  </a>
                </Link>
              </div>
            }
          </Toolbar>
          {
            loading ?
            <Spinner />
            :
            <div className={Styles.gridContainer} onClick={this.deselect} onScroll={this.onGridScroll} ref={r => this.gridContainer = r}>
              {
                pitches.map(pitch => (
                  <PitchPile
                    key={pitch.id}
                    onSelectFile={this.onSelectFile}
                    pitch={pitch}
                    onUpdatePitch={this.onUpdatePitch}
                    selected={selectedFile && selectedFile.id === pitch.id}
                  />
                ))
              }
            </div>
          }
          <Dialog
            open={openDelete}
            onClose={this.closeDelete}
          >
            <DialogTitle>{"Are you sure you want to delete this file?"}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                This action canot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.closeDelete} color="primary" autoFocus>
                Cancel
              </Button>
              <Button onClick={this.onDeleteFile} color="secondary">
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </main>
      </Layout>
    )
  }
}

export default withRouter(Gallery);