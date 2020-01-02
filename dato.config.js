const htmlTag = require('html-tag');

// This function helps transforming structures like:
//
// [{ tagName: 'meta', attributes: { name: 'description', content: 'foobar' } }]
//
// into proper HTML tags:
//
// <meta name="description" content="foobar" />

const toHtml = (tags) => (
  tags.map(({ tagName, attributes, content }) => (
    htmlTag(tagName, attributes, content)
  )).join("")
);

// Arguments that will receive the mapping function:
//
// * dato: lets you easily access any content stored in your DatoCMS
//   administrative area;
//
// * root: represents the root of your project, and exposes commands to
//   easily create local files/directories;
//
// * i18n: allows to switch the current locale to get back content in
//   alternative locales from the first argument.
//
// Read all the details here:
// https://github.com/datocms/js-datocms-client/blob/master/docs/dato-cli.md

module.exports = (dato, root, i18n) => {

  // Add to the existing Hugo config files some properties coming from data
  // stored on DatoCMS
  ['config.dev.toml', 'config.prod.toml'].forEach(file => {
    root.addToDataFile(file, 'toml', {
      title: dato.site.globalSeo.siteName,
      languageCode: i18n.locale
    });
  });

  // Create a YAML data file to store global data about the site
  root.createDataFile('data/settings.yml', 'yaml', {
    name: dato.site.globalSeo.siteName,
    language: dato.site.locales[0],
    faviconMetaTags: toHtml(dato.site.faviconMetaTags),
    copyright: dato.hello.copyright,
    seoMetaTags: toHtml(dato.hello.seoMetaTags)
  });

  // Create a `chapter` directory (or empty it if already exists)...
  root.directory('content/chapters', dir => {
    // ...and for each of the works stored online...
    dato.chapters.forEach((chapter, index) => {
      // ...create a markdown file with all the metadata in the frontmatter
      dir.createPost(`${chapter.slug}.md`, 'yaml', {
        frontmatter: {
          title: chapter.title,
          excerpt: chapter.excerpt,
          order: chapter.order,
          cover: chapter.cover.toMap(),
          modular: chapter.modular.toMap()
        },
        content: chapter.content
      });
    });
  });

  // Create a markdown file with content coming from the `hello` item
  // type stored in DatoCMS
  root.createPost(`content/hello.md`, 'yaml', {
    frontmatter: {
      title: dato.hello.title,
      image: dato.hello.image.toMap()
    },
    content: dato.hello.content
  });

  // Create a markdown file with content coming from the `hello` item
  // type stored in DatoCMS
  root.createPost(`content/print.md`, 'yaml', {
    frontmatter: {
      title: dato.print.title,
      layout: dato.print.layout
    }
  });

};
