
// ICS Calendar file generation utility

export function generateICS(events: {
    title: string;
    description?: string;
    location?: string;
    startDate: Date;
    endDate: Date;
    id: string;
}[]): string {
    const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const escapeText = (text: string) => {
        return text
            .replace(/\\/g, '\\\\')
            .replace(/,/g, '\\,')
            .replace(/;/g, '\\;')
            .replace(/\n/g, '\\n');
    };

    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//KidActivity//Activity Schedule//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
    ];

    for (const event of events) {
        lines.push('BEGIN:VEVENT');
        lines.push(`UID:${event.id}@kidactivity.local`);
        lines.push(`DTSTAMP:${formatDate(new Date())}`);
        lines.push(`DTSTART:${formatDate(event.startDate)}`);
        lines.push(`DTEND:${formatDate(event.endDate)}`);
        lines.push(`SUMMARY:${escapeText(event.title)}`);

        if (event.description) {
            lines.push(`DESCRIPTION:${escapeText(event.description)}`);
        }
        if (event.location) {
            lines.push(`LOCATION:${escapeText(event.location)}`);
        }

        lines.push('END:VEVENT');
    }

    lines.push('END:VCALENDAR');

    return lines.join('\r\n');
}
