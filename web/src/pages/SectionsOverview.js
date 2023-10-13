import React, { useEffect, useState } from "react";
import TextContentList from "../components/TextContentList.js";
import ImageContentGrid from "../components/ImageContentGrid.js";
import sanityClient from "../client.js";
import { Themed } from "theme-ui";
import rightArrow from "../assets/images/right-arrow.svg";
import { Link } from "react-router-dom";
import Frame from "../components/Frame";

const sectionsOverviewSx = {
  ".sectionHeader": {
    fontStyle: "italic",
    borderBottom: "1px solid #000",
    marginBottom: "1vh",
    h2: { display: "inline-block", marginRight: "0.4em" },
    img: { height: "10.0em", display: "inline-block" },
  },
  ".sectionContainer": {
    paddingBottom: "5em",
    paddingInline: "5vw",
  },
  ".searchBarContainer": {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "1vh",
  },
  ".searchBar": {
    width: "100%", // Set the width to 100% for the search bar
    paddingRight: "5vw", // If you want to preserve some space on the right, adjust paddingRight as needed
  },
};


const sectionToQueryBySearch = (searchQuery) => {
  return `*[_type == "contentItem" && (title match "${searchQuery}" || authors[] match "${searchQuery}")] | order(publishedAt desc) {
    title,
    authors[]->{name},
    issue->{title, slug},
    sections[]->{title, slug},
    slug,
    body,
    mainImage{
      asset->{
        _id,
        url
      }
    }
  }[0...3]`;
};

const sectionToQueryBySection = (section) => {
  return section !== "Art"
    ? `*[_type == "contentItem" && "${section}" in sections[]->title] | order(publishedAt desc) {
        title,
        authors[]->{name},
        issue->{title, slug},
        sections[]->{title, slug},
        slug,
        body,
        mainImage{
          asset->{
            _id,
            url
          }
        }
    }[0...3]`
    : `*[_type == "contentItem" && "${section}" in sections[]->title] | order(publishedAt desc) {
        title,
        authors[]->{name},
        issue->{title, slug},
        slug,
        sections[]->{title, slug},
        mainImage{
          asset->{
            _id,
            url
          }
        },
        images[]{asset->{_id, url}}
    }[0...3]`;
};

export default function SectionsOverview(props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState(null);
  const [artItems, setArtItems] = useState(null);
  const [fictionItems, setFictionItems] = useState(null);
  const [featuresItems, setFeaturesItems] = useState(null);
  const [poetryItems, setPoetryItems] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await sanityClient.fetch(sectionToQueryBySearch(searchQuery));
        setFilteredItems(result);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [searchQuery]);

  useEffect(() => {
    const fetchDataBySection = async () => {
      try {
        const artResult = await sanityClient.fetch(sectionToQueryBySection("Art"));
        setArtItems(artResult);

        const fictionResult = await sanityClient.fetch(sectionToQueryBySection("Fiction"));
        setFictionItems(fictionResult);

        const featuresResult = await sanityClient.fetch(sectionToQueryBySection("Features"));
        setFeaturesItems(featuresResult);

        const poetryResult = await sanityClient.fetch(sectionToQueryBySection("Poetry"));
        setPoetryItems(poetryResult);
      } catch (error) {
        console.error(error);
      }
    };

    fetchDataBySection();
  }, []);

  const sectionHeader = (section) => (
    <div className="sectionHeader">
      <Link to={`/sections/${section}`}>
        <Themed.h2>{section}</Themed.h2>
        <img src={rightArrow} alt="right-arrow" />
      </Link>
    </div>
  );

  return (
    <div sx={sectionsOverviewSx}>
      <Frame
        path={[
          {
            name: "Sections",
          },
        ]}
      >
        <div className="searchBarContainer">
          <input
            type="text"
            placeholder="Search for titles"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '50%' }} // Add the style here
          />
        </div>

        <div className="sectionContainer">
          {searchQuery.trim() !== "" ? (
            <>
              <Themed.h2>Search Results</Themed.h2>
              {filteredItems && filteredItems.length > 0 ? (
                <ImageContentGrid items={filteredItems} />
              ) : (
                <div>No results found.</div>
              )}
            </>
          ) : (
            <>
              <div className="sectionContainer">
                {sectionHeader("Art")}
                {artItems && <ImageContentGrid items={artItems} />}
              </div>
              <div className="sectionContainer">
                {sectionHeader("Fiction")}
                {fictionItems && <TextContentList items={fictionItems} />}
              </div>
              <div className="sectionContainer">
                {sectionHeader("Features")}
                {featuresItems && <TextContentList items={
                              featuresItems} />}
                              </div>
                              <div className="sectionContainer">
                                {sectionHeader("Poetry")}
                                {poetryItems && <TextContentList items={poetryItems} />}
                              </div>
                              </>
                              )}
                              </div>
                              </Frame>
                              </div>
                              );
                              }

