import clsx from "clsx";
import Link from "next/link";
import { GetStaticProps } from "next";
import { useEffect, useState } from "react";
import TOFData, { Languages, Character, languages } from "@dvaji/tof-builds";

import CharacterPortrait from "@components/tof/CharacterPortrait";

import useDebounce from "@hooks/use-debounce";
import useIntl from "@hooks/use-intl";
import { getDefaultLocale, getLocale } from "@lib/localData";
import { TOF_IMGS_CDN } from "@lib/constants";
import { setBackground } from "@state/background-atom";
import { getRarityColor, rarityToNumber } from "@utils/rarity";
import Metadata from "@components/Metadata";

type Props = {
  characters: Character[];
};

function Characters({ characters }: Props) {
  const [filteredCharacters, setFilteredCharacters] = useState(characters);
  const [searchTerm, setSearchTerm] = useState("");
  const [rarityFilter, setRarityFilter] = useState("");
  const [elementFilter, setElementFilter] = useState("");
  const [resonanceFilter, setResonanceFilter] = useState("");
  const { t } = useIntl("characters");

  const debouncedSearchTerm = useDebounce(searchTerm, 200);

  const filterCharacters = () => {
    setFilteredCharacters(
      characters
        .filter((c) => {
          let nameFilter = true;
          let rarityFil = true;
          let typeFil = true;
          let roleFil = true;
          if (debouncedSearchTerm) {
            nameFilter =
              c.name.toUpperCase().indexOf(debouncedSearchTerm.toUpperCase()) >
              -1;
          }

          if (rarityFilter) {
            rarityFil = c.rarity === rarityFilter;
          }

          if (elementFilter) {
            typeFil = c.element === elementFilter;
          }

          if (resonanceFilter) {
            console.log(c.resonance, resonanceFilter);
            roleFil = c.resonance === resonanceFilter;
          }

          return nameFilter && rarityFil && typeFil && roleFil;
        })
        .sort((a, b) => {
          return (
            rarityToNumber(b.rarity) - rarityToNumber(a.rarity) ||
            a.name.localeCompare(b.name)
          );
        })
    );
  };

  // Call useEffect to filter characters when search term changes
  useEffect(filterCharacters, [
    characters,
    debouncedSearchTerm,
    rarityFilter,
    resonanceFilter,
    elementFilter,
  ]);

  const rarityOptions = [
    // { value: "R", label: "R" },
    { value: "SR", label: "SR" },
    { value: "SSR", label: "SSR" },
  ];

  const elementOptions = [
    { value: "Fire", label: "fire" },
    { value: "Ice", label: "ice" },
    { value: "Physical", label: "physical" },
    { value: "Volt", label: "volt" },
  ];

  const resonanceOptions = [
    { value: "DPS", label: "dps" },
    { value: "Defense", label: "defense" },
    { value: "Support", label: "support" },
  ];

  useEffect(() => {
    setBackground({
      image: `${TOF_IMGS_CDN}/bg/fulilingqu_bg_OS1.png`,
      gradient: {
        background: "linear-gradient(rgba(26,28,35,.5),rgb(26, 29, 39) 620px)",
      },
    });
  }, []);
  return (
    <div>
      <Metadata
        pageTitle={t({
          id: "title",
          defaultMessage: "ToF Impact Build Guide",
        })}
        pageDescription={t({
          id: "description",
          defaultMessage:
            "All the best characters and their builds ranked in order of power, viability, and versatility to clear content.",
        })}
      />
      <div className="flex justify-between py-3">
        <h2 className="text-2xl text-tof-100">Characters and Weapons</h2>
        <div>
          <input
            type="text"
            className="rounded bg-vulcan-700 px-2 py-1 text-white"
            placeholder={t({ id: "search", defaultMessage: "Search..." })}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap justify-between rounded border border-vulcan-700 bg-vulcan-700/90 py-2 px-4">
        <div className="">
          {rarityOptions.map((rarity) => (
            <button
              className={clsx(
                "mr-2 px-2 py-1 text-xl hover:bg-tof-700",
                rarity.value === rarityFilter && "bg-tof-700",
                getRarityColor(rarity.value)
              )}
              key={rarity.value}
              onClick={() => {
                if (rarityFilter === rarity.value) {
                  setRarityFilter("");
                } else {
                  setRarityFilter(rarity.value);
                }
              }}
            >
              {rarity.label}
            </button>
          ))}
        </div>
        <div>
          {elementOptions.map((element) => (
            <button
              className={clsx(
                "mr-2 px-2 py-1 text-xl hover:bg-tof-700",
                element.value === elementFilter && "bg-tof-700"
              )}
              key={element.value}
              onClick={() => {
                if (elementFilter === element.value) {
                  setElementFilter("");
                } else {
                  setElementFilter(element.value);
                }
              }}
            >
              <img
                src={`${TOF_IMGS_CDN}/icons/${element.label}.png`}
                className="h-7 w-7"
                alt={element.value}
              />
            </button>
          ))}
        </div>
        <div>
          {resonanceOptions.map((resonance) => (
            <button
              className={clsx(
                "mr-2 px-2 py-1 text-xl hover:bg-tof-700",
                resonance.value === resonanceFilter && "bg-tof-700"
              )}
              key={resonance.value}
              onClick={() => {
                if (resonanceFilter === resonance.value) {
                  setResonanceFilter("");
                } else {
                  setResonanceFilter(resonance.value);
                }
              }}
            >
              <img
                src={`${TOF_IMGS_CDN}/icons/${resonance.label}.png`}
                className="h-7 w-7"
                alt={resonance.value}
              />
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1 rounded border border-vulcan-700 bg-vulcan-700/90 py-4 px-4 shadow-lg md:grid-cols-3 lg:grid-cols-4">
        {filteredCharacters.map((character) => (
          <Link key={character.id} href={`/tof/character/${character.id}`}>
            <a>
              <CharacterPortrait character={character} key={character.id} />
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale = "en" }) => {
  const defaultLocale = getDefaultLocale(
    locale,
    languages as unknown as string[]
  );
  const lngDict = await getLocale(defaultLocale, "tof");
  const tofData = new TOFData({
    language: defaultLocale as Languages,
  });
  const characters = await tofData.characters({
    select: [
      "id",
      "name",
      "rarity",
      "element",
      "resonance",
      "weapon_id",
      "weapon",
    ],
  });

  return {
    props: {
      characters: characters.sort((a, b) => a.name.localeCompare(b.name)),
      lngDict,
    },
  };
};

export default Characters;