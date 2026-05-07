import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type NotificationMethod = "sms" | "whatsapp" | "both";

export interface Contact {
  id: string;
  name: string;
  phone: string;
  notificationMethod: NotificationMethod;
}

interface ContactsContextType {
  contacts: Contact[];
  addContact: (contact: Omit<Contact, "id">) => Promise<void>;
  updateContact: (id: string, contact: Omit<Contact, "id">) => Promise<void>;
  removeContact: (id: string) => Promise<void>;
  isLoading: boolean;
}

const ContactsContext = createContext<ContactsContextType | null>(null);

const STORAGE_KEY = "@sos_mulher_contacts";

export function ContactsProvider({ children }: { children: React.ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setContacts(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Erro ao carregar contatos:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveContacts = async (newContacts: Contact[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newContacts));
    setContacts(newContacts);
  };

  const addContact = useCallback(async (contact: Omit<Contact, "id">) => {
    const newContact: Contact = {
      ...contact,
      id: Date.now().toString(),
    };
    const updated = [...contacts, newContact];
    await saveContacts(updated);
  }, [contacts]);

  const updateContact = useCallback(async (id: string, contact: Omit<Contact, "id">) => {
    const updated = contacts.map((c) => (c.id === id ? { ...contact, id } : c));
    await saveContacts(updated);
  }, [contacts]);

  const removeContact = useCallback(async (id: string) => {
    const updated = contacts.filter((c) => c.id !== id);
    await saveContacts(updated);
  }, [contacts]);

  return (
    <ContactsContext.Provider value={{ contacts, addContact, updateContact, removeContact, isLoading }}>
      {children}
    </ContactsContext.Provider>
  );
}

export function useContacts() {
  const ctx = useContext(ContactsContext);
  if (!ctx) throw new Error("useContacts must be used within ContactsProvider");
  return ctx;
}
