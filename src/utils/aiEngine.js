export const analyzeProductivity = (routineLogs, tasks) => {
  if (routineLogs.length < 3) {
    return [
      {
        icon: '📚',
        text: 'Log more routines to unlock AI recommendations',
        timeRange: 'Get started today',
        type: 'info'
      }
    ];
  }

  const recommendations = [];
  
  const productiveHours = findProductiveHours(routineLogs);
  if (productiveHours.length > 0) {
    recommendations.push({
      icon: '🎯',
      text: `Your focus is highest between ${productiveHours[0]}`,
      timeRange: 'Schedule important tasks here',
      type: 'productivity'
    });
  }

  const lowProductivityHours = findLowProductivityHours(routineLogs);
  if (lowProductivityHours.length > 0) {
    recommendations.push({
      icon: '⚠️',
      text: `Avoid heavy tasks around ${lowProductivityHours[0]}`,
      timeRange: 'Take breaks or do light activities',
      type: 'warning'
    });
  }

  const sleepAnalysis = analyzeSleepPerformance(routineLogs);
  if (sleepAnalysis.needsMoreSleep) {
    recommendations.push({
      icon: '😴',
      text: sleepAnalysis.message,
      timeRange: 'Sleep affects your performance',
      type: 'health'
    });
  }

  const upcomingHighPriority = tasks
    .filter(t => !t.completed && t.priority === 'High')
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0];
    
  if (upcomingHighPriority) {
    const hoursUntil = Math.floor(
      (new Date(upcomingHighPriority.deadline) - new Date()) / (1000 * 60 * 60)
    );
    if (hoursUntil < 24 && hoursUntil > 0) {
      recommendations.push({
        icon: '🔥',
        text: `High-priority task deadline in ${hoursUntil} hours`,
        timeRange: upcomingHighPriority.name,
        type: 'urgent'
      });
    }
  }

  const freeSlot = findNextFreeSlot(tasks);
  if (freeSlot) {
    recommendations.push({
      icon: '✨',
      text: 'Free slot available - recommended study time',
      timeRange: freeSlot,
      type: 'opportunity'
    });
  }

  return recommendations;
};

const findProductiveHours = (logs) => {
  const hourlyProductivity = {};
  
  logs.forEach(log => {
    if (log.studyHours > 0) {
      const hour = new Date(log.date).getHours();
      hourlyProductivity[hour] = (hourlyProductivity[hour] || 0) + log.studyHours;
    }
  });

  const sortedHours = Object.entries(hourlyProductivity)
    .sort((a, b) => b[1] - a[1])
    .map(([hour]) => {
      const h = parseInt(hour);
      return `${h}:00 - ${h + 2}:00`;
    });

  return sortedHours;
};

const findLowProductivityHours = (logs) => {
  const hourlyBreaks = {};
  
  logs.forEach(log => {
    if (log.breaks > 30) {
      const hour = new Date(log.date).getHours();
      hourlyBreaks[hour] = (hourlyBreaks[hour] || 0) + 1;
    }
  });

  return Object.entries(hourlyBreaks)
    .sort((a, b) => b[1] - a[1])
    .map(([hour]) => {
      const h = parseInt(hour);
      return `${h}:00 - ${h + 1}:00`;
    })
    .slice(0, 1);
};

const analyzeSleepPerformance = (logs) => {
  const recentLogs = logs.slice(-7);
  const avgSleep = recentLogs.reduce((sum, log) => {
    const sleep = calculateSleepHours(log.wakeupTime, log.sleepTime);
    return sum + sleep;
  }, 0) / recentLogs.length;

  if (avgSleep < 6) {
    return {
      needsMoreSleep: true,
      message: 'Sleep earlier - performance drops on 6-hr sleep days'
    };
  } else if (avgSleep > 9) {
    return {
      needsMoreSleep: true,
      message: 'You might be oversleeping - 7-8 hours is optimal'
    };
  }

  return { needsMoreSleep: false };
};

const calculateSleepHours = (wakeup, sleep) => {
  if (!wakeup || !sleep) return 7;
  
  const [wh, wm] = wakeup.split(':').map(Number);
  const [sh, sm] = sleep.split(':').map(Number);
  
  let hours = wh - sh;
  if (hours < 0) hours += 24;
  
  return hours;
};

const findNextFreeSlot = (tasks) => {
  const now = new Date();
  const today = tasks.filter(t => 
    !t.completed && 
    new Date(t.deadline).toDateString() === now.toDateString()
  );

  if (today.length === 0) {
    const currentHour = now.getHours();
    if (currentHour >= 9 && currentHour < 22) {
      return `Now - ${currentHour + 1}:00`;
    }
  }

  return null;
};

export const detectTaskConflicts = (tasks, newTask) => {
  const conflicts = [];
  
  const newStart = new Date(newTask.scheduledTime);
  const newEnd = new Date(newStart.getTime() + newTask.duration * 60 * 60 * 1000);

  tasks.forEach(task => {
    if (task.id === newTask.id || task.completed) return;
    
    const taskStart = new Date(task.scheduledTime);
    const taskEnd = new Date(taskStart.getTime() + task.duration * 60 * 60 * 1000);

    if (
      (newStart >= taskStart && newStart < taskEnd) ||
      (newEnd > taskStart && newEnd <= taskEnd) ||
      (newStart <= taskStart && newEnd >= taskEnd)
    ) {
      conflicts.push(task);
    }
  });

  return conflicts;
};

export const recommendTimeSlot = (tasks, duration) => {
  const workingHours = [];
  for (let hour = 6; hour <= 22; hour++) {
    workingHours.push(hour);
  }

  const today = new Date();
  const recommendations = [];

  workingHours.forEach(hour => {
    const slotStart = new Date(today);
    slotStart.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(slotStart.getTime() + duration * 60 * 60 * 1000);

    const hasConflict = tasks.some(task => {
      if (task.completed) return false;
      const taskStart = new Date(task.scheduledTime);
      const taskEnd = new Date(taskStart.getTime() + task.duration * 60 * 60 * 1000);
      
      return (
        (slotStart >= taskStart && slotStart < taskEnd) ||
        (slotEnd > taskStart && slotEnd <= taskEnd)
      );
    });

    if (!hasConflict) {
      recommendations.push({
        time: `${hour}:00`,
        score: calculateTimeScore(hour),
        reason: getTimeReason(hour)
      });
    }
  });

  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
};

const calculateTimeScore = (hour) => {
  if (hour >= 7 && hour <= 9) return 95;
  if (hour >= 19 && hour <= 21) return 90;
  if (hour >= 14 && hour <= 16) return 70;
  if (hour >= 10 && hour <= 12) return 85;
  return 60;
};

const getTimeReason = (hour) => {
  if (hour >= 7 && hour <= 9) return 'Morning peak focus time';
  if (hour >= 19 && hour <= 21) return 'Evening high productivity';
  if (hour >= 14 && hour <= 16) return 'Post-lunch moderate energy';
  if (hour >= 10 && hour <= 12) return 'Late morning clarity';
  return 'Available time slot';
};