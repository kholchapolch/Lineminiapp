import { headers } from "next/headers";
import {
  UTAG_DATA_SCRIPT,
  sonyDataLayerScript,
  tealiumAsyncLoader,
  tealiumEnvironment,
  tealiumSyncSrc,
} from "@/lib/tealium";

function requestLink(): string | null {
  const headerStore = headers();
  return headerStore.get("x-forwarded-host") ?? headerStore.get("host");
}

function requestEnvironment(): ReturnType<typeof tealiumEnvironment> {
  return tealiumEnvironment(requestLink(), {
    debug: headers().get("x-debug") === "1",
  });
}

export function TealiumHeadScripts(): JSX.Element {
  const environment = requestEnvironment();

  return (
    <>
      <script
        id="utag-data"
        type="text/javascript"
        dangerouslySetInnerHTML={{ __html: UTAG_DATA_SCRIPT }}
      />
      {/* utag.sync.js must stay blocking, after utag_data and before the Sony data layer. */}
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <script
        id="utag-sync"
        type="text/javascript"
        src={tealiumSyncSrc(environment)}
      />
      <script
        id="sony-data-layer"
        type="text/javascript"
        dangerouslySetInnerHTML={{ __html: sonyDataLayerScript() }}
      />
    </>
  );
}

export function TealiumBodyScript(): JSX.Element {
  return (
    <script
      id="utag-loader"
      type="text/javascript"
      dangerouslySetInnerHTML={{
        __html: tealiumAsyncLoader(requestEnvironment()),
      }}
    />
  );
}
