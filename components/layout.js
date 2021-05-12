
import Head from 'next/head'
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import CssBaseline from '@material-ui/core/CssBaseline';
import Link from 'next/link'
import { useRouter } from 'next/router'


export default function Layout({ children }) {
  const router = useRouter();
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <CssBaseline />
      <AppBar position="static">
        <Tabs value={false}>
          <Link href="/gallery">
            <a>
              <Tab label="Gallery" selected={router.pathname=="/gallery"}/>
            </a>
          </Link>
          <Link href="/invest">
            <a>
              <Tab label="Invest" selected={router.pathname=="/invest"}/>
            </a>
          </Link>
        </Tabs>
      </AppBar>
      {children}
    </>
  )
}