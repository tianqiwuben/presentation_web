import Head from 'next/head'
import Layout from '../components/layout';
import { withRouter } from 'next/router'
import React,{Component} from 'react';
import {getPitch} from '../utils/apis';
import Spinner from '../components/spinner';
import styles from './invest.module.css';
import { Typography } from '@material-ui/core';
import Carousel from 'react-material-ui-carousel'
import Button from '@material-ui/core/Button';
import Link from 'next/link';
import clxs from 'clsx';

class Invest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      pitch: null,
      selectedThumb: 0,
      thumbRef: {},
    }
  }

  componentDidMount() {
    const {router} = this.props;
    console.log(router.query);
    let pid = router.query.pitchId || 'latest';
    getPitch(pid).then(resp => {
      console.log(resp);
      if (resp.data && resp.data.payload) {
        this.setState({
          loading: false,
          pitch: resp.data.payload,
        })
      }
    }).catch(error => {

    })

  }

  onChangeIdx = (idx) => {
    this.setState({selectedThumb: idx});
    const {thumbRef} = this.state;
    thumbRef[idx].scrollIntoView({behavior: "smooth"});
  }


  render() {
    const {pitch, loading, selectedThumb, thumbRef} = this.state;
    return (
      <Layout>
        <Head>
          <title>Invest</title>
        </Head>
        <main>
          {
            loading ?
            <Spinner />
            :
            <div className={styles.container}>
              <div className={styles.sliderContainr}>
                <Carousel
                  animation="slide"
                  autoPlay={false}
                  onChange={this.onChangeIdx}
                  index={selectedThumb}
                >
                  {
                    pitch.images.map(img => (
                      <div key={img} className={styles.imgContainer}>
                        <img className={styles.img} src={img} />
                      </div>
                    ))
                  }
                </Carousel>
                <Typography variant="body1" align="center">
                  {pitch.filename}
                </Typography>
                <Link href={pitch.download_url}>
                  <a>
                    <Button variant="outlined">
                      Download
                    </Button>
                  </a>
                </Link>
              </div>
              <div className={styles.thumbsContainer}>
                {
                  pitch.thumbs.map((thumb, idx) => (
                    <div
                      key={thumb}
                      className={clxs({
                          [styles.thumb]: true,
                          [styles.thumbSelected]: selectedThumb == idx,
                        })
                      }
                      onClick={() => this.onChangeIdx(idx)}
                      ref={r => thumbRef[idx] = r}
                    >
                      <img src={thumb} className={styles.thumbImg}/>
                    </div>
                  ))
                }
              </div>
            </div>
          }
          
        </main>
      </Layout>
    )
  }
}

export default withRouter(Invest);
