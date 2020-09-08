const fs = require('fs')
const conventionalChangelog = require('conventional-changelog')

/**
 * Generates a changelog stream with the given arguments
 *
 * @param tagPrefix
 * @param preset
 * @param version
 * @param releaseCount
 * @returns {*}
 */
const getChangelogStream = (tagPrefix, preset, version, releaseCount, config) => conventionalChangelog({
  preset,
  releaseCount: parseInt(releaseCount, 10),
  tagPrefix,
  config
},
  {
    version,
    currentTag: `${tagPrefix}${version}`,
  },
  {},
  config && config.parserOpts,
  config && config.writerOpts
)

module.exports = getChangelogStream

/**
 * Generates a string changelog
 *
 * @param tagPrefix
 * @param preset
 * @param version
 * @param releaseCount
 * @returns {Promise<string>}
 */
module.exports.generateStringChangelog = (tagPrefix, preset, version, releaseCount, config) => new Promise((resolve, reject) => {
  const changelogStream = getChangelogStream(tagPrefix, preset, version, releaseCount, config)

  let changelog = ''

  changelogStream
    .on('data', (data) => {
      changelog += data.toString()
    })
    .on('end', () => resolve(changelog))
})

/**
 * Generates a file changelog
 *
 * @param tagPrefix
 * @param preset
 * @param version
 * @param fileName
 * @param releaseCount
 * @returns {Promise<>}
 */
module.exports.generateFileChangelog = (tagPrefix, preset, version, fileName, releaseCount, config) => new Promise((resolve) => {
  const changelogStream = getChangelogStream(tagPrefix, preset, version, releaseCount, config)

  changelogStream
    .pipe(fs.createWriteStream(fileName))
    .on('finish', resolve)
})
var Haikunator = require('haikunator')

module.exports = {

    // Jira integration
    jira: {

        // API
        api: {
            // Root host of your JIRA installation without protocol.
            // (i.e 'yourapp.atlassian.net')
            host: 'teamglobalrisk.atlassian.net',
            // Email address of the user to login with
            email: 'j.wester@chargebacks911.com',
            // Auth token of the user to login with
            // https://confluence.atlassian.com/cloud/api-tokens-938839638.html
            token: '${{ secrets.GH_TOKEN}}',
        },

        // Jira base web URL
        // Set to the base URL for your Jira account
        baseUrl: 'https://teamglobalrisk.atlassian.net',

        // Regex used to match the issue ticket key
        // Use capture group one to isolate the key text within surrounding characters (if needed).
        ticketIDPattern: /\[([A-Z]+\-[0-9]+)\]/i,

        // Status names that mean the ticket is approved.
        approvalStatus: ['Done', 'Closed', 'Accepted'],

        // Tickets to exclude from the changelog, by type name
        excludeIssueTypes: ['Sub-task', 'Story Bug'],

        // Tickets to include in changelog, by type name.
        // If this is defined, `excludeIssueTypes` is ignored.
        includeIssueTypes: [],

        // Get the release version name to use when using `--release` without a value.
        // Returns a Promise
        generateReleaseVersionName: function () {
            const haikunator = new Haikunator();
            return Promise.resolve(haikunator.haikunate());
        }
    },

    transformData: (data) => {
        // Link the ticket numbers in all commit summaries.
        data.commits.all.forEach((commit) => {
            commit.summary = commit.summary.replace(
                /\[([A-Z]+\-[0-9]+)\]/,
                '[<a href="https://teamglobalrisk.atlassian.net/browse/$1">$1</a>]'
            );
        });
        return Promise.resolve(data);
    },
}