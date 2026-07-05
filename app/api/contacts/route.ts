import { connectToDatabase } from '@/lib/mongodb'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
    try {
        const { db } = await connectToDatabase()
        const contacts = await db
            .collection('contacts')
            .find({})
            .sort({ createdAt: -1 })
            .toArray()
        return NextResponse.json(contacts)
    } catch (error) {
        console.error('GET /api/contacts error:', error)
        return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const { db } = await connectToDatabase()
        const body = await request.json()

        if (!body.name || !String(body.name).trim()) {
            return NextResponse.json({ error: 'Contact name is required' }, { status: 400 })
        }

        const now = new Date().toISOString()
        const newContact = {
            name: String(body.name).trim(),
            email: body.email || '',
            phone: body.phone || '',
            company: body.company || '',
            role: body.role || '',
            location: body.location || '',
            linkedin: body.linkedin || '',
            website: body.website || '',
            source: body.source || '',
            relationship: body.relationship || '',
            description: body.description || '',
            color: body.color || '#2563eb',
            projectIds: Array.isArray(body.projectIds) ? body.projectIds : [],
            createdAt: now,
            updatedAt: now,
        }

        const result = await db.collection('contacts').insertOne(newContact as any)
        return NextResponse.json({ _id: result.insertedId, ...newContact })
    } catch (error) {
        console.error('POST /api/contacts error:', error)
        return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 })
    }
}
