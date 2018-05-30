import got from 'got';
import isEqual from 'date-fns/is_equal'
import startOfToday from 'date-fns/start_of_today'
import startOfDay from 'date-fns/start_of_day';

class Slack {
  constructor(message, ctx) {
    if (typeof message.attachments === 'undefined') {
      this.message = null;
      this.ctx = ctx;
      
      return;
    }

    if (!('footer' in message.attachments[0])) {
      this.message = null;
    } else {
      this.message = message;
    }

    this.ctx = ctx;
  }

  isToday() {
    if (this.message === null) {
      return false;
    }

    return isEqual(startOfDay(this.message.ts * 1000), startOfToday());
  }

  into() {
    if (this.message === null) {
      return [];
    }

    return this.message.attachments.map(attachment => {
      const ctx = JSON.parse(attachment.footer);

      return {
        id: ctx.id,
        history: true,
        repository: ctx.repository,
        url: attachment.title_link,
        issueTitle: attachment.title
      };
    });
  }

  deleteLatestMessage = async (slack) => {
    if (this.message === null) {
      return false;
    }

    const {body} = await got('https://slack.com/api/chat.delete', {
      query: {
        token: this.ctx.slackToken,
        channel: this.ctx.slackChannel,
        ts: this.message.ts,
      }
    }); 
  }
}

export const fetchLatestMessage = async ctx => {
  const {body} = await got('https://slack.com/api/conversations.history', {
    query: {
      token: ctx.slackToken,
      channel: ctx.slackChannel,
      limit: 1
    }
  });

  return new Slack(JSON.parse(body).messages[0], ctx);
};