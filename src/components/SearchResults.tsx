import React from 'react';
import { Box, Text } from 'ink';

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  keyword: string;
  highlightIndex?: number | null;
  aiSummary?: string | null;
}

export function SearchResults({ results, keyword, highlightIndex, aiSummary }: SearchResultsProps) {
  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">
        Search results for "{keyword}"
      </Text>
      <Text dimColor>
        {results.length} result(s) found
      </Text>

      <Box flexDirection="column" marginTop={1}>
        {results.map((result, index) => {
          const isHighlighted = highlightIndex === index;
          return (
            <Box key={result.link} flexDirection="column" marginBottom={2}>
              <Box>
                <Text bold color={isHighlighted ? 'green' : 'yellow'}>{`[${index + 1}] `}</Text>
                <Text bold color={isHighlighted ? 'green' : undefined}>{result.title}</Text>
              </Box>
              <Text color="blue" underline>
                {result.link}
              </Text>
              <Text wrap="wrap">{result.snippet}</Text>
            </Box>
          );
        })}
      </Box>

      {results.length === 0 && (
        <Text color="red">No results found.</Text>
      )}

      {aiSummary && (
        <Box flexDirection="column" marginTop={2}>
          <Text bold color="magenta">AI Summary:</Text>
          <Text wrap="wrap">{aiSummary}</Text>
        </Box>
      )}
    </Box>
  );
}
