import { memo, ReactNode } from "react";
import { Build } from "interfaces/build";
import WeaponCard from "./WeaponCard";
import ArtifactRecommendedStats from "./ArtifactRecommendedStats";
import ArtifactCard from "./ArtifactCard";
import { Artifact, Weapon } from "genshin-data";
import { IntlFormatProps } from "@hooks/use-intl";

type Props = {
  build: Build;
  weapons: Record<string, Weapon>;
  artifacts: Record<string, Artifact>;
  f: (props: IntlFormatProps) => JSX.Element;
};

const CharacterBuildCard = ({ build, weapons, artifacts, f }: Props) => {
  return (
    <div className="">
      {/* <p>{build.name}</p> */}
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="flex flex-wrap w-full lg:w-4/5 pr-2 content-start">
          <div className="text-xl mb-2 font-semibold">
            {f({
              id: "weapons",
              defaultMessage: "Weapons",
            })}
            :
          </div>
          <div>
            {build.weapons
              .map<ReactNode>((weapon) => (
                <WeaponCard
                  key={weapon.id}
                  weapon={weapons[weapon.id]}
                  refinement={weapon.r}
                />
              ))
              .reduce((prev, curr, i) => [
                prev,
                <div key={`art_divider_${i}`} className="build-option-divider">
                  {f({
                    id: "or",
                    defaultMessage: "Or",
                  })}
                </div>,
                curr,
              ])}
          </div>
        </div>
        <div className="flex flex-wrap w-full lg:w-4/5 ml-2 content-start">
          <div className="text-xl mb-2 font-semibold w-full">
            {f({
              id: "character.talents_priority",
              defaultMessage: "Talents Priority",
            })}
          </div>
          <div className="w-full mb-2">
            {build.talent_priority
              .map<ReactNode>((talent) => <span>{talent}</span>)
              .reduce((prev, curr, i) => [
                prev,
                <span key={`art_divider_${i}`} className="mx-3">
                  {">"}
                </span>,
                curr,
              ])}
          </div>
          <div className="text-xl mb-2 font-semibold">
            {f({
              id: "artifacts",
              defaultMessage: "Artifacts",
            })}
            :
          </div>
          <div className="w-full mb-3">
            <h2 className="font-bold">
              {f({
                id: "character.recommended_primary_stats",
                defaultMessage: "Recommended Primary Stats",
              })}
            </h2>
            <ArtifactRecommendedStats stats={build.stats} />
            <div>
              <h2 className="font-bold">
                {f({
                  id: "character.substats_priority",
                  defaultMessage: "Substats priority",
                })}
              </h2>
              <div className="text-sm">{build.stats_priority.join(" / ")}</div>
            </div>
          </div>
          {build.sets
            .map<ReactNode>((set) => (
              <div key={`${set.set_1}-${set.set_2}`}>
                {set.set_2 ? (
                  <div className="flex flex-row w-full">
                    <ArtifactCard artifact={artifacts[set.set_1]} pieces={2} />
                    <ArtifactCard artifact={artifacts[set.set_2]} pieces={2} />
                  </div>
                ) : (
                  <ArtifactCard artifact={artifacts[set.set_1]} pieces={4} />
                )}
              </div>
            ))
            .reduce((prev, curr, i) => [
              prev,
              <div key={`art_divider_${i}`} className="build-option-divider">
                {f({
                  id: "or",
                  defaultMessage: "Or",
                })}
              </div>,
              curr,
            ])}
        </div>
      </div>
    </div>
  );
};

export default memo(CharacterBuildCard);