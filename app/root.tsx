import type {
  LinksFunction,
  LoaderArgs,
  LoaderFunction,
  MetaFunction,
} from '@remix-run/node';
import { json } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
} from '@remix-run/react';

import globalStylesUrl from '~/styles/global.css';
import interFont from '@fontsource/inter/index.css';
import { getUser } from './session.server';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: interFont },
  { rel: 'stylesheet', href: globalStylesUrl },
];

export const meta: MetaFunction = () => {
  return {
    charset: 'utf-8',
    title: 'Sydney Zhao',
    viewport: 'width=device-width,initial-scale=1',
  };
};

export const loader: LoaderFunction = async ({ request }: LoaderArgs) => {
  return json({
    user: await getUser(request),
  });
};

function Document({
  children,
  title = `Sydney Zhao`,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <html lang='en'>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
      <div className='error-container'>
        <h1>
          {caught.status} {caught.statusText}
        </h1>
      </div>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Document title='Uh-oh!'>
      <div className='error-container'>
        <h1>App Error</h1>
        <pre>{error.message}</pre>
      </div>
    </Document>
  );
}
