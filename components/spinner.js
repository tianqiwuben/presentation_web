

import CircularProgress from '@material-ui/core/CircularProgress';
import styles from './spinner.module.css';

export default function Spinner({ children }) {
  return (
    <div className={styles.container}>
      <CircularProgress />
    </div>
  )
}