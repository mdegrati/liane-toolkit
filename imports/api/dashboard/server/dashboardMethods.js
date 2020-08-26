import SimpleSchema from "simpl-schema";
import moment from "moment";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { Comments } from "/imports/api/facebook/comments/comments.js";
import {
    People
} from "/imports/api/facebook/people/people.js";
import { Likes } from "/imports/api/facebook/likes/likes.js";

import redisClient from "/imports/startup/server/redis";


export const summaryData = new ValidatedMethod({
    name: "dashboard.summary",
    validate: new SimpleSchema({
        campaignId: {
            type: String,
        },

    }).validator(),
    run({ campaignId }) {

        logger.debug("dashboard.summary", { campaignId });
        const userId = Meteor.userId();


        if (
            !userId ||
            !Meteor.call("campaigns.isUserTeam", {
                campaignId,
                userId,
            })
        ) {
            throw new Meteor.Error(401, "You are not allowed to do this action");
        }

        const campaign = Campaigns.findOne(campaignId);
        const facebookAccountId = campaign.facebookAccount.facebookId;
        const redisKey = `dashboard.${facebookAccountId}.dataSummary`;

        let dataSummary = redisClient.getSync(redisKey);

        if (!dataSummary) {

            // 1 -  Total people in people directory
            const toCount = People.find({
                campaignId
            });
            const totalPeople = Promise.await(
                toCount.count()
            )
            // 2 - Total positive reactions(like, love and wow)
            let positiveReactions = 0;
            positiveReactions = Promise.await(Likes.find({
                facebookAccountId,
                "type": { "$in": ['LIKE', 'CARE', 'PRIDE', 'LOVE', 'WOW', 'THANKFUL'] }
            }).count())

            // 3 - Total comments
            let comments = 0;
            comments = Promise.await(
                Comments.find({
                    facebookAccountId
                }).count()
            )
            // 4 - Total people with canReceivePrivateReply
            const toPM = People.find({
                campaignId,
                receivedAutoPrivateReply: true
            });
            const peoplePM = Promise.await(
                toPM.count()
            )
            // redis update
            dataSummary = JSON.stringify({
                totalPeople,
                positiveReactions,
                comments,
                peoplePM
            });
            redisClient.setSync(
                redisKey,
                dataSummary,
                "EX",
                60 * 60 // 1 hour
            );
        }

        return JSON.parse(dataSummary);
    },
});
export const achievements = new ValidatedMethod({
    name: "dashboard.achievements",
    validate: new SimpleSchema({
        campaignId: {
            type: String,
        },
    }).validator(),
    run({ campaignId }) {

        logger.debug("dashboard.achievements", { campaignId });
        const userId = Meteor.userId();


        if (
            !userId ||
            !Meteor.call("campaigns.isUserTeam", {
                campaignId,
                userId,
            })
        ) {
            throw new Meteor.Error(401, "You are not allowed to do this action");
        }
        const campaign = Campaigns.findOne(campaignId);
        const facebookAccountId = campaign.facebookAccount.facebookId;
        const redisKey = `dashboard.${facebookAccountId}.achievements`;

        let achievements = redisClient.getSync(redisKey);

        if (!achievements) {
            // 1  - Total forms filled
            const filledForms = Promise.await(
                People.find({
                    campaignId,
                    source: 'form'
                }).count()
            )
            // 2 - Total people with geolocation
            const geolocated = Promise.await(
                People.find({
                    campaignId,
                    location: { $exists: true },
                }).count()
            )
            // 3 - Total comments replied by the page account

            achievements = JSON.stringify({ filledForms, geolocated });
            redisClient.setSync(
                redisKey,
                achievements,
                "EX",
                60 * 60 // 1 hour
            );
        }
        // return 
        return JSON.parse(achievements);
    },
});

