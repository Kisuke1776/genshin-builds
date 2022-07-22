import { memo } from "react";
import clsx from "clsx";
import dynamic from "next/dynamic";
import { Artifact } from "genshin-data";
import { LazyLoadImage } from "react-lazy-load-image-component";

import { getUrl } from "@lib/imgUrl";
import useIntl from "@hooks/use-intl";

const Tooltip = dynamic(() => import("./Tooltip"), {
  ssr: false,
});

interface ArtifactCardProps {
  artifacts: [Artifact & { children?: Artifact[] }];
}

const ArtifactChooseCard = ({ artifacts }: ArtifactCardProps) => {
  const { t } = useIntl("character");

  return (
    <div className="bg-vulcan-900 border border-vulcan-700 mb-2 rounded-md mr-1 w-full">
      <h4 className="m-2 text-xs">
        {t({ id: "choose_2", defaultMessage: "Choose 2" })}
      </h4>
      <div className="flex flex-row flex-wrap m-2 justify-between">
        {artifacts.map((artifact) => (
          <Tooltip
            key={artifact.id}
            className="mb-2"
            contents={
              <div className="p-2 text-sm">
                {artifact.children ? (
                  artifact.children.map((ca, i) => (
                    <div
                      key={ca.id + artifact.id}
                      className={clsx("py-1 border-gray-600 block", {
                        "border-b": i + 1 < artifact.children!.length,
                      })}
                    >
                      <LazyLoadImage
                        src={getUrl(`/artifacts/${ca.id}.png`, 76, 76)}
                        height={32}
                        width={32}
                        className="h-8 ml-1 mr-2 inline-block"
                        alt={artifact.name}
                      />
                      {ca.name}
                    </div>
                  ))
                ) : (
                  <>
                    <p className="py-2 border-b border-gray-600">
                      {artifact["two_pc"]}
                    </p>
                    <p className="py-2">{artifact["four_pc"]}</p>
                  </>
                )}
              </div>
            }
          >
            <div className="flex flex-col lg:flex-row h-full w-full">
              <div
                className={clsx(
                  "flex lg:flex-none bg-cover p-1 items-center justify-center rounded-lg"
                )}
                style={{
                  backgroundImage: `url(${getUrl(
                    `/bg_${artifact.max_rarity}star.png`
                  )})`,
                }}
              >
                <LazyLoadImage
                  src={getUrl(`/artifacts/${artifact.id}.png`, 48, 48)}
                  height={24}
                  width={24}
                  className="w-9 h-9"
                  alt={artifact.name}
                />
              </div>
              <div className="flex items-center relative p-2">
                <div className="font-bold text-white">{artifact.name}</div>
                <div className="ml-2 text-xs font-semibold bg-vulcan-600 text-gray-200 p-1 px-2 rounded-md">
                  2
                </div>
              </div>
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default memo(ArtifactChooseCard);