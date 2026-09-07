import Campaign from '../models/Campaign.js';
import Wish from '../models/Wish.js';

const VALID_STATUSES = [
  'draft',
  'active',
  'completed',
  'archived',
];

function calculateStats(wishes = []) {
  const stats = {
    total: wishes.length,
    available: 0,
    reserved: 0,
    granted: 0,
    paused: 0,
    completionRate: 0,
  };

  for (const wish of wishes) {
    if (
      Object.prototype.hasOwnProperty.call(
        stats,
        wish.status
      )
    ) {
      stats[wish.status] += 1;
    }
  }

  stats.completionRate =
    stats.total > 0
      ? Number(
          (
            (stats.granted /
              stats.total) *
            100
          ).toFixed(1)
        )
      : 0;

  return stats;
}

function buildFoundationBreakdown(wishes = []) {
  const foundations = new Map();

  for (const wish of wishes) {
    const name =
      wish.partnerFoundation?.trim() ||
      'Unspecified Foundation';

    if (!foundations.has(name)) {
      foundations.set(name, {
        name,
        total: 0,
        available: 0,
        reserved: 0,
        granted: 0,
        paused: 0,
      });
    }

    const entry =
      foundations.get(name);

    entry.total += 1;

    if (
      Object.prototype.hasOwnProperty.call(
        entry,
        wish.status
      )
    ) {
      entry[wish.status] += 1;
    }
  }

  return Array.from(
    foundations.values()
  ).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

export async function listCampaigns(
  req,
  res,
  next
) {
  try {
    const campaigns =
      await Campaign.find()
        .sort({
          startDate: -1,
          createdAt: -1,
        })
        .lean();

    const campaignIds =
      campaigns.map(
        (campaign) =>
          campaign._id
      );

    const wishes =
      campaignIds.length > 0
        ? await Wish.find({
            campaign: {
              $in: campaignIds,
            },
          })
            .select(
              'campaign status partnerFoundation'
            )
            .lean()
        : [];

    const wishesByCampaign =
      new Map();

    for (const wish of wishes) {
      const key =
        wish.campaign.toString();

      if (
        !wishesByCampaign.has(
          key
        )
      ) {
        wishesByCampaign.set(
          key,
          []
        );
      }

      wishesByCampaign
        .get(key)
        .push(wish);
    }

    const result =
      campaigns.map(
        (campaign) => {
          const campaignWishes =
            wishesByCampaign.get(
              campaign._id.toString()
            ) || [];

          const stats =
            calculateStats(
              campaignWishes
            );

          return {
            ...campaign,
            stats,
          };
        }
      );

    res.json({
      campaigns: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCampaign(
  req,
  res,
  next
) {
  try {
    const campaign =
      await Campaign.findById(
        req.params.id
      ).lean();

    if (!campaign) {
      return res.status(404).json({
        message:
          'Campaign not found.',
      });
    }

    const wishes =
      await Wish.find({
        campaign:
          campaign._id,
      })
        .select(
          'status partnerFoundation'
        )
        .lean();

    res.json({
      campaign,
      stats:
        calculateStats(wishes),
      foundations:
        buildFoundationBreakdown(
          wishes
        ),
    });
  } catch (error) {
    next(error);
  }
}

export async function createCampaign(
  req,
  res,
  next
) {
  try {
    const {
      name,
      academicPeriod = '',
      description = '',
      startDate,
      deadline,
    } = req.body;

    if (
      !name?.trim() ||
      !startDate ||
      !deadline
    ) {
      return res
        .status(400)
        .json({
          message:
            'Campaign name, start date, and deadline are required.',
        });
    }

    const start =
      new Date(startDate);

    const end =
      new Date(deadline);

    if (
      Number.isNaN(
        start.getTime()
      ) ||
      Number.isNaN(
        end.getTime()
      )
    ) {
      return res
        .status(400)
        .json({
          message:
            'Please provide valid campaign dates.',
        });
    }

    if (end <= start) {
      return res
        .status(400)
        .json({
          message:
            'The campaign deadline must be after the start date.',
        });
    }

    /*
     * New campaigns always begin as Draft.
     * They must be explicitly activated later.
     */
    const campaign =
      await Campaign.create({
        name: name.trim(),
        academicPeriod:
          academicPeriod.trim(),
        description:
          description.trim(),
        startDate: start,
        deadline: end,
        status: 'draft',
      });

    res.status(201).json({
      message:
        'Campaign created successfully.',
      campaign,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCampaign(
  req,
  res,
  next
) {
  try {
    const campaign =
      await Campaign.findById(
        req.params.id
      );

    if (!campaign) {
      return res.status(404).json({
        message:
          'Campaign not found.',
      });
    }

    /*
     * Lifecycle changes are deliberately not handled
     * through the normal edit endpoint.
     *
     * Draft → Active
     * Active → Completed
     * Completed → Archived
     *
     * must use the dedicated endpoints below.
     */
    const {
      name,
      academicPeriod,
      description,
      startDate,
      deadline,
    } = req.body;

    if (
      name !== undefined
    ) {
      if (!name.trim()) {
        return res
          .status(400)
          .json({
            message:
              'Campaign name cannot be empty.',
          });
      }

      campaign.name =
        name.trim();
    }

    if (
      academicPeriod !==
      undefined
    ) {
      campaign.academicPeriod =
        academicPeriod.trim();
    }

    if (
      description !==
      undefined
    ) {
      campaign.description =
        description.trim();
    }

    if (
      startDate !== undefined
    ) {
      const parsedStart =
        new Date(
          startDate
        );

      if (
        Number.isNaN(
          parsedStart.getTime()
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              'Invalid campaign start date.',
          });
      }

      campaign.startDate =
        parsedStart;
    }

    if (
      deadline !== undefined
    ) {
      const parsedDeadline =
        new Date(
          deadline
        );

      if (
        Number.isNaN(
          parsedDeadline.getTime()
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              'Invalid campaign deadline.',
          });
      }

      campaign.deadline =
        parsedDeadline;
    }

    if (
      campaign.deadline <=
      campaign.startDate
    ) {
      return res
        .status(400)
        .json({
          message:
            'The campaign deadline must be after the start date.',
        });
    }

    await campaign.save();

    res.json({
      message:
        'Campaign details updated successfully.',
      campaign,
    });
  } catch (error) {
    next(error);
  }
}

export async function activateCampaign(
  req,
  res,
  next
) {
  try {
    const campaign =
      await Campaign.findById(
        req.params.id
      );

    if (!campaign) {
      return res.status(404).json({
        message:
          'Campaign not found.',
      });
    }

    if (
      campaign.status ===
      'active'
    ) {
      return res.json({
        message:
          'Campaign is already active.',
        campaign,
      });
    }

    if (
      campaign.status !==
      'draft'
    ) {
      return res
        .status(400)
        .json({
          message:
            'Only draft campaigns can be activated.',
        });
    }

    const existingActive =
      await Campaign.findOne({
        status: 'active',
        _id: {
          $ne: campaign._id,
        },
      });

    if (existingActive) {
      return res
        .status(409)
        .json({
          message: `"${existingActive.name}" is currently active. Complete that campaign before activating another one.`,
          activeCampaign:
            existingActive,
        });
    }

    campaign.status =
      'active';

    await campaign.save();

    res.json({
      message:
        'Campaign activated successfully.',
      campaign,
    });
  } catch (error) {
    /*
     * Handles the partial unique index race condition
     * if two officers attempt activation simultaneously.
     */
    if (
      error?.code === 11000
    ) {
      return res
        .status(409)
        .json({
          message:
            'Another campaign is already active. Complete it before activating this campaign.',
        });
    }

    next(error);
  }
}

export async function completeCampaign(
  req,
  res,
  next
) {
  try {
    const campaign =
      await Campaign.findById(
        req.params.id
      );

    if (!campaign) {
      return res.status(404).json({
        message:
          'Campaign not found.',
      });
    }

    if (
      campaign.status !==
      'active'
    ) {
      return res
        .status(400)
        .json({
          message:
            'Only the active campaign can be completed.',
        });
    }

    campaign.status =
      'completed';

    await campaign.save();

    res.json({
      message:
        'Campaign completed successfully.',
      campaign,
    });
  } catch (error) {
    next(error);
  }
}

export async function archiveCampaign(
  req,
  res,
  next
) {
  try {
    const campaign =
      await Campaign.findById(
        req.params.id
      );

    if (!campaign) {
      return res.status(404).json({
        message:
          'Campaign not found.',
      });
    }

    if (
      campaign.status !==
      'completed'
    ) {
      return res
        .status(400)
        .json({
          message:
            'Only completed campaigns can be archived.',
        });
    }

    campaign.status =
      'archived';

    await campaign.save();

    res.json({
      message:
        'Campaign archived successfully.',
      campaign,
    });
  } catch (error) {
    next(error);
  }
}

export async function getActiveCampaign(
  req,
  res,
  next
) {
  try {
    const campaign =
      await Campaign.findOne({
        status: 'active',
      })
        .sort({
          createdAt: -1,
        })
        .lean();

    res.json({
      campaign:
        campaign || null,
    });
  } catch (error) {
    next(error);
  }
}