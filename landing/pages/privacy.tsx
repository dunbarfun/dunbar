import React from 'react';
import {marked} from 'marked';
import fs from 'fs';
import path from 'path';

export default function Privacy({ content }: { content: string}) {
  return (
    <div className="text-neutral-400 p-12 flex flex-col items-center">
    <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), 'assets/markdown/Privacy.md');
  const fileContents = fs.readFileSync(filePath, 'utf8');

  const content = marked(fileContents, { breaks: true,  gfm: true  });

  return {
    props: {
      content,
    },
  };
}