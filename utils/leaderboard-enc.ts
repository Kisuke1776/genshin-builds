import { Build, Player } from "@prisma/client";
import { Artifact, Character, Weapon } from "genshin-data";

import { CharactersAPI } from "interfaces/enka";
import { ENKA_NAMES, REAL_SUBSTAT_VALUES, STAT_NAMES } from "./substats";

export function encodeBuilds(data: CharactersAPI[]) {
  return data.map((avatar) => {
    const equip = avatar.equipList
      .map((item) => {
        if (item.flat.itemType === "ITEM_WEAPON") {
          return {
            type: item.flat.itemType,
            itemId: item.itemId,
            level: item.weapon.level,
            promoteLevel: item.weapon.promoteLevel ?? 0,
            refinement: Object.values(item.weapon.affixMap || { x: 0 })[0],
            stats: item.flat.weaponStats
              .map(
                (st: any) => `${STAT_NAMES[st.appendPropId]}|${st.statValue}`
              )
              .join(","),
          };
        }
        if (item.flat.itemType === "ITEM_RELIQUARY") {
          const substatsParsed = item.reliquary.appendPropIdList.reduce(
            (acc, id) => {
              const { type } = REAL_SUBSTAT_VALUES[id];
              const realStatName = STAT_NAMES[type];
              return {
                ...acc,
                [realStatName]: {
                  count: (acc[realStatName]?.count ?? 0) + 1,
                },
              };
            },
            {} as any
          );

          let critDmg = 0;
          let critRate = 0;
          const encodeSubstats = item.flat.reliquarySubstats
            .map((st: any) => {
              if (st.appendPropId === "FIGHT_PROP_CRITICAL") {
                critRate = st.statValue;
              } else if (st.appendPropId === "FIGHT_PROP_CRITICAL_HURT") {
                critDmg = st.statValue;
              }
              return `${STAT_NAMES[st.appendPropId]}|${st.statValue}/${
                substatsParsed[STAT_NAMES[st.appendPropId]].count
              }`;
            })
            .join(",");

          return {
            equipType: item.flat.equipType,
            type: item.flat.itemType,
            itemId: item.itemId,
            level: item.flat.rankLevel,
            mainstat: `${STAT_NAMES[item.flat.reliquaryMainstat.mainPropId]}|${
              item.flat.reliquaryMainstat.statValue
            }`,
            substats: encodeSubstats,
            critValue: (critDmg || 0) + (critRate || 0) * 2,
            substatsidlist: item.reliquary.appendPropIdList.join(","),
          };
        }
      })
      .reduce((acc, item: any) => {
        if (!item) return acc;
        if (item.equipType === "EQUIP_BRACER") {
          acc.flower = item;
        }
        if (item.equipType === "EQUIP_NECKLACE") {
          acc.plume = item;
        }
        if (item.equipType === "EQUIP_SHOES") {
          acc.sands = item;
        }
        if (item.equipType === "EQUIP_RING") {
          acc.goblet = item;
        }
        if (item.equipType === "EQUIP_DRESS") {
          acc.circlet = item;
        }
        if (!item.equipType) {
          acc.weapon = item;
        }
        return acc;
      }, {} as { flower: any; plume: any; sands: any; goblet: any; circlet: any; weapon: any });
    const encodedData = {
      avatarId: avatar.avatarId,
      exp: avatar.propMap[1001]?.val ?? 0, // propMap.1001
      ascension: avatar.propMap[1002].val, // propMap.1002
      level: avatar.propMap[4001].val, // propMap.4001
      fightprops: Object.entries(avatar.fightPropMap)
        .map(([a, b]) => `${ENKA_NAMES[a] ? ENKA_NAMES[a] : a}|${b}`)
        .join(","),
      skilllevel: Object.entries(avatar.skillLevelMap)
        .map(([a, b]) => `${a}|${b}`)
        .join(","),
      fetterlevel: avatar.fetterInfo.expLevel,
      constellations: avatar?.talentIdList?.length ?? 0,
      ...equip,
    };

    return {
      avatarId: encodedData.avatarId,
      level: Number(encodedData.level),
      ascension: Number(encodedData.ascension),
      fetterLevel: Number(encodedData.fetterlevel),
      constellation: encodedData.constellations,
      fightProps: encodedData.fightprops,
      skillLevel: encodedData.skilllevel,
      critValue: Object.values(equip).reduce(
        (acc, item: any) => acc + (item.critValue || 0),
        0
      ),
      plumeId: encodedData.plume?.itemId,
      plumeMainStat: encodedData.plume?.mainstat,
      plumeSubStats: encodedData.plume?.substats,
      plumeSubstatsId: encodedData.plume?.substatsidlist,
      plumeCritValue: encodedData.plume?.critValue,
      flowerId: encodedData.flower?.itemId,
      flowerMainStat: encodedData.flower?.mainstat,
      flowerSubStats: encodedData.flower?.substats,
      flowerSubstatsId: encodedData.flower?.substatsidlist,
      flowerCritValue: encodedData.flower?.critValue,
      sandsId: encodedData.sands?.itemId,
      sandsMainStat: encodedData.sands?.mainstat,
      sandsSubStats: encodedData.sands?.substats,
      sandsSubstatsId: encodedData.sands?.substatsidlist,
      sandsCritValue: encodedData.sands?.critValue,
      gobletId: encodedData.goblet?.itemId,
      gobletMainStat: encodedData.goblet?.mainstat,
      gobletSubStats: encodedData.goblet?.substats,
      gobletSubstatsId: encodedData.goblet?.substatsidlist,
      gobletCritValue: encodedData.goblet?.critValue,
      circletId: encodedData.circlet?.itemId,
      circletMainStat: encodedData.circlet?.mainstat,
      circletSubStats: encodedData.circlet?.substats,
      circletSubstatsId: encodedData.circlet?.substatsidlist,
      circletCritValue: encodedData.circlet?.critValue,
      weaponId: encodedData.weapon.itemId,
      weaponLevel: encodedData.weapon.level,
      weaponPromoteLevel: encodedData.weapon.promoteLevel,
      weaponRefinement: encodedData.weapon.refinement,
      weaponStat: encodedData.weapon.stats,
    };
  });
}

export async function decodeBuilds(
  data: (Build & {
    player?: Player;
  })[],
  characters: Character[],
  weapons: Weapon[],
  artifacts: Artifact[]
) {
  const artifactsDetail = await import(
    "../_content/genshin/data/artifacts_detail.json"
  );
  const decodeStr = (str: string | null): Record<string, number> =>
    str
      ? str.split(",").reduce((acc, stat) => {
          const [key, value] = stat.split("|");
          return {
            ...acc,
            [key]: Number(value),
          };
        }, {})
      : {};
  const decodeSubstatStr = (str: string | null): Record<string, number> =>
    str
      ? str.split(",").reduce((acc, stat) => {
          const [key, data] = stat.split("|");
          const [value, count] = data.split("/");
          return {
            ...acc,
            [key]: {
              value: Number(value),
              count: Number(count),
            },
          };
        }, {})
      : {};

  return data.map((build) => {
    const character = characters.find((c) => c._id === build.avatarId);

    if (!character) {
      return null;
    }

    const weapon = weapons.find((w) => w._id === build.weaponId);
    let flowerSet: Artifact | null = null;
    let plumeSet: Artifact | null = null;
    let sandsSet: Artifact | null = null;
    let gobletSet: Artifact | null = null;
    let circletSet: Artifact | null = null;
    artifactsDetail.default.forEach((value) => {
      if (!value.ids) {
        return;
      }
      if (
        build.flowerId &&
        value.ids.includes(build.flowerId.toString().slice(0, 4))
      ) {
        flowerSet = artifacts.find(
          (a) => a._id === Number("2" + value.set)
        ) as Artifact;
      }

      if (
        build.plumeId &&
        value.ids.includes(build.plumeId.toString().slice(0, 4))
      ) {
        plumeSet = artifacts.find(
          (a) => a._id === Number("2" + value.set)
        ) as Artifact;
      }

      if (
        build.sandsId &&
        value.ids.includes(build.sandsId.toString().slice(0, 4))
      ) {
        sandsSet = artifacts.find(
          (a) => a._id === Number("2" + value.set)
        ) as Artifact;
      }

      if (
        build.gobletId &&
        value.ids.includes(build.gobletId.toString().slice(0, 4))
      ) {
        gobletSet = artifacts.find(
          (a) => a._id === Number("2" + value.set)
        ) as Artifact;
      }

      if (
        build.circletId &&
        value.ids.includes(build.circletId.toString().slice(0, 4))
      ) {
        circletSet = artifacts.find(
          (a) => a._id === Number("2" + value.set)
        ) as Artifact;
      }
    });

    // remove duplicates and the ones that doesn't have 2 pieces or more
    const sets = [
      flowerSet!.id,
      plumeSet!.id,
      sandsSet!.id,
      gobletSet!.id,
      circletSet!.id,
    ]
      .filter((value, index, self) => {
        return (
          self.indexOf(value) === index &&
          self.filter((v) => v === value).length >= 2
        );
      })
      .map((id) => artifacts.find((a) => a.id === id) as Artifact);

    const stats = decodeStr(build.fightProps);
    const flowerSubstats = decodeSubstatStr(build.flowerSubStats);
    const plumeSubstats = decodeSubstatStr(build.plumeSubStats);
    const sandsSubstats = decodeSubstatStr(build.sandsSubStats);
    const gobletSubstats = decodeSubstatStr(build.gobletSubStats);
    const circletSubstats = decodeSubstatStr(build.circletSubStats);

    const flower = build.flowerId
      ? {
          flower: {
            artifactId: build.flowerId,
            id: flowerSet!.flower?.id,
            name: flowerSet!.flower?.name,
            rarity: flowerSet!.max_rarity,
            mainStat: decodeStr(build.flowerMainStat),
            subStats: flowerSubstats,
            subStatsIds: build.flowerSubstatsId,
            critValue: Number(build.flowerCritValue),
          },
        }
      : {};
    const plume = build.plumeId
      ? {
          plume: {
            artifactId: build.plumeId,
            id: plumeSet!.plume?.id,
            name: plumeSet!.plume?.name,
            rarity: plumeSet!.max_rarity,
            mainStat: decodeStr(build.plumeMainStat),
            subStats: plumeSubstats,
            subStatsIds: build.plumeSubstatsId,
            critValue: Number(build.plumeCritValue),
          },
        }
      : {};
    const sands = build.sandsId
      ? {
          sands: {
            artifactId: build.sandsId,
            id: sandsSet!.sands?.id,
            name: sandsSet!.sands?.name,
            rarity: sandsSet!.max_rarity,
            mainStat: decodeStr(build.sandsMainStat),
            subStats: sandsSubstats,
            subStatsIds: build.sandsSubstatsId,
            critValue: Number(build.sandsCritValue),
          },
        }
      : {};
    const goblet = build.gobletId
      ? {
          goblet: {
            artifactId: build.gobletId,
            id: gobletSet!.goblet?.id,
            name: gobletSet!.goblet?.name,
            rarity: gobletSet!.max_rarity,
            mainStat: decodeStr(build.gobletMainStat),
            subStats: gobletSubstats,
            subStatsIds: build.gobletSubstatsId,
            critValue: Number(build.gobletCritValue),
          },
        }
      : {};
    const circlet = build.circletId
      ? {
          circlet: {
            artifactId: build.circletId,
            id: circletSet!.circlet?.id,
            name: circletSet!.circlet?.name,
            rarity: circletSet!.max_rarity,
            mainStat: decodeStr(build.circletMainStat),
            subStats: circletSubstats,
            subStatsIds: build.circletSubstatsId,
            critValue: Number(build.circletCritValue),
          },
        }
      : {};
    const player = build.player
      ? {
          player: {
            uuid: build.player.uuid,
            nickname: build.player.nickname,
            region: regionParse(build.player?.uuid),
          },
        }
      : {};

    return {
      _id: build.id,
      avatarId: build.avatarId,
      id: character.id,
      name: character.name,
      rarity: character.rarity,
      level: build.level,
      ascension: build.ascension,
      constellation: build.constellation,
      fetterLevel: build.fetterLevel,
      stats,
      critValue: Number(build.critValue),
      ...flower,
      ...plume,
      ...sands,
      ...goblet,
      ...circlet,
      sets,
      weapon: {
        weaponId: build.weaponId,
        id: weapon?.id,
        name: weapon?.name,
        rarity: weapon?.rarity,
        level: build.weaponLevel,
        promoteLevel: build.weaponPromoteLevel,
        refinement: build.weaponRefinement,
        stat: decodeStr(build.weaponStat),
      },
      ...player,
    };
  });
}

export function regionParse(uuid: string) {
  const suffix = uuid[0];
  switch (suffix) {
    case "0":
      return "Internal";
    case "1":
    case "2":
      return "CN";
    case "5":
      return "B";
    case "6":
      return "NA";
    case "7":
      return "EU";
    case "8":
      return "ASIA";
    case "9":
      return "TW";
    default:
      return "Unknown";
  }
}