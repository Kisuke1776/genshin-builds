import { memo, ReactNode } from "react";
import { Artifact, Weapon } from "genshin-data";

import WeaponCard from "./WeaponCard";
import ArtifactRecommendedStats from "./ArtifactRecommendedStats";
import ArtifactChooseCard from "./ArtifactChooseCard";
import ArtifactCard from "./ArtifactCard";
import SkillLabel from "../SkillLabel";

import { Build } from "interfaces/build";
import useIntl from "@hooks/use-intl";

type Props = {
  build: Build;
  weapons: Record<string, Weapon>;
  artifacts: Record<string, Artifact>;
};

const CharacterBuildCard = ({ build, weapons, artifacts }: Props) => {
  const { t: f } = useIntl("character");
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2">
      <div className="flex w-full flex-wrap content-start pr-2 lg:pr-4">
        <div className="mb-2 text-xl font-semibold">
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
              <div key={`weapon_divider_${i}`} className="build-option-divider">
                {f({
                  id: "or",
                  defaultMessage: "Or",
                })}
              </div>,
              curr,
            ])}
        </div>
      </div>
      <div className="flex w-full flex-wrap content-start md:ml-2">
        <div className="mb-2 w-full text-xl font-semibold">
          {f({
            id: "talents_priority",
            defaultMessage: "Talents Priority",
          })}
        </div>
        <div className="mb-2 w-full">
          {build.talent_priority
            .map<ReactNode>((talent) => (
              <span key={`tal-${talent}`}>
                <SkillLabel skill={talent.toLowerCase()} />
              </span>
            ))
            .reduce((prev, curr, i) => [
              prev,
              <span key={`talent_p_divider_${i}`} className="mx-3">
                {">"}
              </span>,
              curr,
            ])}
        </div>
        <div className="mb-2 text-xl font-semibold">
          {f({
            id: "artifacts",
            defaultMessage: "Artifacts",
          })}
          :
        </div>
        <div className="mb-3 w-full">
          <h2 className="font-bold">
            {f({
              id: "recommended_primary_stats",
              defaultMessage: "Recommended Primary Stats",
            })}
          </h2>
          <ArtifactRecommendedStats stats={build.stats} />
          <div className="mb-2">
            <h2 className="font-bold">
              {f({
                id: "substats_priority",
                defaultMessage: "Substats priority",
              })}
            </h2>
            <div>{build.stats_priority.join(" / ")}</div>
          </div>
        </div>
        {build.sets
          .map<ReactNode>((set) => (
            <div className="flex w-full flex-row" key={`${set.join("")}`}>
              {set.length > 2 ? (
                <ArtifactChooseCard
                  artifacts={
                    set
                      .map(
                        (artifactId) =>
                          artifacts[artifactId] && artifacts[artifactId]
                      )
                      .filter((a) => a !== undefined) as [
                      Artifact & { children?: Artifact[] | undefined }
                    ]
                  }
                />
              ) : (
                <ArtifactCard
                  artifact={artifacts[set[0]]}
                  artifact2={set.length > 1 ? artifacts[set[1]] : undefined}
                />
              )}
            </div>
          ))
          .reduce((prev, curr, i) => [
            prev,
            <div key={`set_divider_${i}`} className="build-option-divider">
              {f({
                id: "or",
                defaultMessage: "Or",
              })}
            </div>,
            curr,
          ])}
      </div>
    </div>
  );
};

export default memo(CharacterBuildCard);
