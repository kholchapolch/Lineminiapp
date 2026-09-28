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

export function TealiumHeadScripts(): JSX.Element {
  const environment = tealiumEnvironment(requestLink());

  return (
    <>
      <script
        id="utag-data"
        type="text/javascript"
        dangerouslySetInnerHTML={{ __html: UTAG_DATA_SCRIPT }}
      />
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
        __html: tealiumAsyncLoader(tealiumEnvironment(requestLink())),
      }}
    />
  );
}
