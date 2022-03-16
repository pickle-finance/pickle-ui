import { ReactElement } from "react";
import Link from "v2/components/Link";

/**
 * A utility function that lets us apply our custom link formatting
 * to the text we receive from the docs endpoint.
 *
 * The strategy is as follows:
 * 1. Identify all links, capture href and anchor text values.
 *    The RegExp match array will be [match, href, anchor text].
 * 2. Split the text where links are found (this removes them).
 * 3. Join the parts together with our Link components.
 */
export const renderHtmlFromString = (text: string): ReactElement => {
  const capturePattern = /<a href=\"(.*?)\">(.*?)<\/a>/g;
  const splitPattern = /<a href=\".*?\">.*?<\/a>/;
  const matches = [...text.matchAll(capturePattern)];

  if (matches.length === 0) return <span>{text}</span>;

  return (
    <>
      {text.split(splitPattern).map((part, index) => (
        <span key={index}>
          {part}
          {matches[index] && (
            <Link href={matches[index][1]} external primary>
              {matches[index][2]}
            </Link>
          )}
        </span>
      ))}
    </>
  );
};
